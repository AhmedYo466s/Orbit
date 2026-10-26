import Link from "next/link";
import {
  getContext,
  getMembers,
  errorMessages,
  statusLabels,
  priorityLabels,
} from "@/lib/context";
import { createTask, updateTaskStatus } from "../actions";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  assignee_id: string | null;
  project_id: string;
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { error?: string; status?: string; q?: string };
}) {
  const { supabase, companyId } = await getContext();
  const today = new Date().toISOString().slice(0, 10);

  const statusFilter =
    searchParams.status && statusLabels[searchParams.status]
      ? searchParams.status
      : "";
  const q = (searchParams.q ?? "").trim().slice(0, 100);

  let query = supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, assignee_id, project_id")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (q) query = query.ilike("title", `%${q}%`);

  const [tasksRes, projectsRes, members] = await Promise.all([
    query,
    supabase.from("projects").select("id, name").eq("company_id", companyId),
    getMembers(supabase, companyId),
  ]);

  const tasks = (tasksRes.data ?? []) as unknown as Task[];
  const projects = (projectsRes.data ?? []) as unknown as {
    id: string;
    name: string;
  }[];
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const memberNames = new Map(members.map((m) => [m.id, m.name]));
  const error = searchParams.error ? errorMessages[searchParams.error] : "";

  return (
    <div>
      <h1>المهام</h1>
      {error && (
        <p className="alert alert--danger" role="alert">
          {error}
        </p>
      )}
      {tasksRes.error && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل المهام.
        </p>
      )}

      {projects.length === 0 ? (
        <p className="muted">
          أنشئ مشروعًا أولًا لتتمكن من إضافة مهام.{" "}
          <Link href="/app/projects">المشروعات</Link>
        </p>
      ) : (
        <form action={createTask} className="form form--inline">
          <label className="field">
            <span>عنوان المهمة</span>
            <input name="title" type="text" required minLength={2} maxLength={200} />
          </label>
          <label className="field">
            <span>المشروع</span>
            <select name="project_id" required>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>المسؤول</span>
            <select name="assignee_id" defaultValue="">
              <option value="">بدون</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>الأولوية</span>
            <select name="priority" defaultValue="medium">
              {Object.entries(priorityLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>موعد التسليم</span>
            <input name="due_date" type="date" dir="ltr" />
          </label>
          <button className="btn btn--primary" type="submit">
            إضافة مهمة
          </button>
        </form>
      )}

      <h2>قائمة المهام</h2>
      <form method="get" className="filters">
        <label className="field">
          <span>بحث</span>
          <input name="q" type="search" defaultValue={q} />
        </label>
        <label className="field">
          <span>الحالة</span>
          <select name="status" defaultValue={statusFilter}>
            <option value="">الكل</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn--ghost" type="submit">
          تصفية
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="muted">لا توجد مهام مطابقة.</p>
      ) : (
        <ul className="list">
          {tasks.map((t) => {
            const late = t.status !== "done" && !!t.due_date && t.due_date < today;
            return (
              <li key={t.id} className="row">
                <div className="row__main">
                  <strong>{t.title}</strong>
                  <span className="row__meta">
                    {projectNames.get(t.project_id) ?? "مشروع"}
                    {" | "}
                    {t.assignee_id
                      ? memberNames.get(t.assignee_id) ?? "مستخدم"
                      : "بدون مسؤول"}
                    {" | "}
                    {priorityLabels[t.priority] ?? t.priority}
                    {t.due_date ? ` | ${t.due_date}` : ""}
                  </span>
                </div>
                {late && <span className="badge badge--late">متأخرة</span>}
                <form action={updateTaskStatus} className="row__form">
                  <input type="hidden" name="id" value={t.id} />
                  <select name="status" defaultValue={t.status} aria-label="الحالة">
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn--ghost" type="submit">
                    تحديث
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
