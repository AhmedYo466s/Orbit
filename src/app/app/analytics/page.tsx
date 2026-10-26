import Link from "next/link";
import "@/components/workflow.css";
import { getContext, getMembers, statusLabels } from "@/lib/context";
import { runStatusLabels } from "@/lib/workflow";

type T = {
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assignee_id: string | null;
  project_id: string;
};

const PERIODS = [
  { key: "7", label: "آخر 7 أيام" },
  { key: "30", label: "آخر 30 يومًا" },
  { key: "90", label: "آخر 90 يومًا" },
  { key: "all", label: "كل الفترات" },
];

function duration(ms: number) {
  const hours = ms / 3600000;
  return hours < 48
    ? `${hours.toFixed(1)} ساعة`
    : `${(hours / 24).toFixed(1)} يوم`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const { supabase, role, companyId } = await getContext();

  if (role === "employee") {
    return (
      <div>
        <h1>التحليلات</h1>
        <p className="muted">هذه الصفحة لمدير الشركة ومدير القسم.</p>
      </div>
    );
  }

  const key = PERIODS.some((p) => p.key === searchParams.days)
    ? (searchParams.days as string)
    : "30";
  const since =
    key === "all"
      ? null
      : new Date(Date.now() - Number(key) * 86400000).toISOString();

  let tasksQuery = supabase
    .from("tasks")
    .select("status, due_date, created_at, updated_at, assignee_id, project_id")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(2000);
  let runsQuery = supabase
    .from("workflow_runs")
    .select("status")
    .eq("company_id", companyId)
    .limit(2000);
  if (since) {
    tasksQuery = tasksQuery.gte("created_at", since);
    runsQuery = runsQuery.gte("created_at", since);
  }

  const [tasksRes, projectsRes, runsRes, members] = await Promise.all([
    tasksQuery,
    supabase.from("projects").select("id, name").eq("company_id", companyId),
    runsQuery,
    getMembers(supabase, companyId),
  ]);

  const tasks = (tasksRes.data ?? []) as unknown as T[];
  const projects = (projectsRes.data ?? []) as unknown as {
    id: string;
    name: string;
  }[];
  const runs = (runsRes.data ?? []) as unknown as { status: string }[];

  const today = new Date().toISOString().slice(0, 10);
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done");
  const overdue = tasks.filter(
    (t) => t.status !== "done" && !!t.due_date && t.due_date < today
  ).length;
  const rate = total ? Math.round((done.length / total) * 100) : 0;
  const avgMs = done.length
    ? done.reduce(
        (sum, t) =>
          sum + (Date.parse(t.updated_at) - Date.parse(t.created_at)),
        0
      ) / done.length
    : null;

  const byStatus = Object.keys(statusLabels).map((k) => ({
    key: k,
    label: statusLabels[k],
    count: tasks.filter((t) => t.status === k).length,
  }));

  const projectRows = projects
    .map((p) => {
      const list = tasks.filter((t) => t.project_id === p.id);
      const d = list.filter((t) => t.status === "done").length;
      return {
        id: p.id,
        name: p.name,
        total: list.length,
        done: d,
        rate: list.length ? Math.round((d / list.length) * 100) : 0,
      };
    })
    .filter((p) => p.total > 0);

  const memberRows = members
    .map((m) => {
      const list = tasks.filter((t) => t.assignee_id === m.id);
      return {
        id: m.id,
        name: m.name,
        done: list.filter((t) => t.status === "done").length,
        open: list.filter((t) => t.status !== "done").length,
      };
    })
    .filter((m) => m.done + m.open > 0);

  const runCounts = Object.keys(runStatusLabels).map((k) => ({
    key: k,
    label: runStatusLabels[k],
    count: runs.filter((r) => r.status === k).length,
  }));

  const loadFailed = tasksRes.error || projectsRes.error || runsRes.error;

  return (
    <div>
      <h1>التحليلات</h1>
      {loadFailed && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل بعض البيانات.
        </p>
      )}

      <nav className="period" aria-label="الفترة الزمنية">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/app/analytics?days=${p.key}`}
            className={p.key === key ? "btn btn--ghost is-active" : "btn btn--ghost"}
          >
            {p.label}
          </Link>
        ))}
      </nav>
      <p className="muted">
        الأرقام تخص المهام وتنفيذات سير العمل التي أُنشئت خلال الفترة المحددة.
      </p>

      {total === 0 ? (
        <p className="muted">لا توجد مهام في هذه الفترة.</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat">
              <strong>{total}</strong>
              <span>إجمالي المهام</span>
            </div>
            <div className="stat">
              <strong>{done.length}</strong>
              <span>المكتملة ({rate}%)</span>
            </div>
            <div className="stat">
              <strong>{overdue}</strong>
              <span>المتأخرة</span>
            </div>
            <div className="stat">
              <strong>{avgMs === null ? "غير متاح" : duration(avgMs)}</strong>
              <span>متوسط وقت الإنجاز</span>
            </div>
          </div>
          <p className="muted">
            متوسط وقت الإنجاز تقدير: من إنشاء المهمة حتى آخر تغيير في حالتها،
            وليس قياسًا دقيقًا لوقت العمل الفعلي.
          </p>
          {tasks.length >= 2000 && (
            <p className="alert alert--warning" role="status">
              عُرضت أحدث 2000 مهمة فقط في هذه الفترة.
            </p>
          )}

          <h2>توزيع المهام حسب الحالة</h2>
          <ul className="list">
            {byStatus.map((s) => (
              <li key={s.key} className="row">
                <span>{s.label}</span>
                <strong>{s.count}</strong>
              </li>
            ))}
          </ul>

          <h2>معدل إنجاز المشروعات</h2>
          {projectRows.length === 0 ? (
            <p className="muted">لا توجد مشروعات بها مهام في هذه الفترة.</p>
          ) : (
            <ul className="list">
              {projectRows.map((p) => (
                <li key={p.id} className="row">
                  <div className="row__main" style={{ flex: 1 }}>
                    <strong>{p.name}</strong>
                    <span className="row__meta">
                      {p.done} من {p.total} ({p.rate}%)
                    </span>
                    <div
                      className="bar"
                      role="img"
                      aria-label={`معدل الإنجاز ${p.rate}%`}
                    >
                      <span style={{ width: `${p.rate}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h2>المهام لكل عضو</h2>
          {memberRows.length === 0 ? (
            <p className="muted">لا توجد مهام مسندة في هذه الفترة.</p>
          ) : (
            <ul className="list">
              {memberRows.map((m) => (
                <li key={m.id} className="row">
                  <strong>{m.name}</strong>
                  <span className="row__meta">
                    مكتملة: {m.done} | مفتوحة: {m.open}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <h2>تنفيذات سير العمل</h2>
      <ul className="list">
        {runCounts.map((r) => (
          <li key={r.key} className="row">
            <span>{r.label}</span>
            <strong>{r.count}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
