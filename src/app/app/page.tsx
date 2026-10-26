import Link from "next/link";
import { getContext } from "@/lib/context";

export default async function OverviewPage() {
  const { supabase, companyId, companyName } = await getContext();
  const today = new Date().toISOString().slice(0, 10);

  const head = { count: "exact", head: true } as const;
  const [projects, open, overdue, done] = await Promise.all([
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
  ]);

  const failed = [projects, open, overdue, done].some((r) => r.error);
  const stats = [
    { label: "المشروعات", value: projects.count ?? 0 },
    { label: "المهام المفتوحة", value: open.count ?? 0 },
    { label: "المهام المتأخرة", value: overdue.count ?? 0 },
    { label: "المهام المكتملة", value: done.count ?? 0 },
  ];
  const empty = (projects.count ?? 0) === 0;

  return (
    <div>
      <h1>{companyName}</h1>
      {failed && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل بعض البيانات.
        </p>
      )}
      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      {empty ? (
        <p>
          لا توجد مشروعات بعد. <Link href="/app/projects">إنشاء أول مشروع</Link>
        </p>
      ) : (
        <p>
          <Link href="/app/tasks">عرض المهام</Link>
        </p>
      )}
    </div>
  );
}
