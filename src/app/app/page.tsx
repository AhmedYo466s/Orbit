import Link from "next/link";
import { FolderPlus, Plus, Workflow, UserPlus } from "lucide-react";
import { getContext } from "@/lib/context";

type Task = { id: string; title: string; due_date: string | null };

export default async function OverviewPage() {
  const { supabase, user, role, companyId, companyName } = await getContext();
  const today = new Date().toISOString().slice(0, 10);
  const head = { count: "exact", head: true } as const;

  const [profileRes, projects, open, overdue, done, tasksRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("projects").select("id", head).eq("company_id", companyId),
      supabase
        .from("tasks")
        .select("id", head)
        .eq("company_id", companyId)
        .neq("status", "done"),
      supabase
        .from("tasks")
        .select("id", head)
        .eq("company_id", companyId)
        .neq("status", "done")
        .lt("due_date", today),
      supabase
        .from("tasks")
        .select("id", head)
        .eq("company_id", companyId)
        .eq("status", "done"),
      supabase
        .from("tasks")
        .select("id, title, due_date")
        .eq("company_id", companyId)
        .neq("status", "done")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5),
    ]);

  const profile = profileRes.data as unknown as { full_name: string } | null;
  const firstName = (profile?.full_name ?? "").trim().split(" ")[0];
  const tasks = (tasksRes.data ?? []) as unknown as Task[];
  const projectCount = projects.count ?? 0;
  const canCreate = role !== "employee";
  const isAdmin = role === "company_admin";
  const failed = [projects, open, overdue, done, tasksRes].some((r) => r.error);

  const stats = [
    { label: "المشروعات", value: projectCount, href: "/app/projects" },
    { label: "المهام المفتوحة", value: open.count ?? 0, href: "/app/tasks" },
    { label: "المهام المتأخرة", value: overdue.count ?? 0, href: "/app/tasks" },
    {
      label: "المهام المكتملة",
      value: done.count ?? 0,
      href: "/app/tasks?status=done",
    },
  ];

  return (
    <div>
      <h1>{firstName ? `مرحبًا، ${firstName}` : "مرحبًا"}</h1>
      <p className="muted">{companyName}</p>

      {failed && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل بعض البيانات.
        </p>
      )}

      <div className="quick">
        <Link href="/app/tasks" className="btn btn--primary btn--icon">
          <Plus size={16} aria-hidden="true" />
          مهمة جديدة
        </Link>
        {canCreate && (
          <Link href="/app/projects" className="btn btn--ghost btn--icon">
            <FolderPlus size={16} aria-hidden="true" />
            مشروع جديد
          </Link>
        )}
        {canCreate && (
          <Link href="/app/workflows" className="btn btn--ghost btn--icon">
            <Workflow size={16} aria-hidden="true" />
            سير عمل جديد
          </Link>
        )}
        {isAdmin && (
          <Link href="/app/team" className="btn btn--ghost btn--icon">
            <UserPlus size={16} aria-hidden="true" />
            دعوة موظف
          </Link>
        )}
      </div>

      <div className="stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>

      {projectCount === 0 &&
        (canCreate ? (
          <>
            <h2>ابدأ من هنا</h2>
            <ol className="start">
              <li>
                أنشئ <Link href="/app/projects">مشروعًا</Link>.
              </li>
              <li>
                أضف <Link href="/app/tasks">مهام</Link> له وحدد المسؤول والموعد.
              </li>
              <li>
                ادعُ فريقك من صفحة <Link href="/app/team">الفريق</Link>.
              </li>
            </ol>
          </>
        ) : (
          <p className="muted">
            لا توجد مشروعات بعد. اطلب من مدير الشركة إنشاء مشروع.
          </p>
        ))}

      <h2>المهام المفتوحة</h2>
      {tasks.length === 0 ? (
        <p className="muted">
          لا توجد مهام مفتوحة. <Link href="/app/tasks">إضافة مهمة</Link>
        </p>
      ) : (
        <ul className="list">
          {tasks.map((t) => {
            const late = !!t.due_date && t.due_date < today;
            return (
              <li key={t.id} className="row">
                <div className="row__main">
                  <strong>{t.title}</strong>
                  <span className="row__meta">
                    {t.due_date ? `الموعد: ${t.due_date}` : "بدون موعد"}
                  </span>
                </div>
                {late && <span className="badge badge--late">متأخرة</span>}
              </li>
            );
          })}
        </ul>
      )}
      <p>
        <Link href="/app/tasks">عرض كل المهام</Link>
      </p>
    </div>
  );
}
