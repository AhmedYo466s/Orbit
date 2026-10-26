import { getContext, getMembers } from "@/lib/context";

type Entry = {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  created_at: string;
};

const phrases: Record<string, string> = {
  "created:tasks": "أنشأ مهمة",
  "created:projects": "أنشأ مشروعًا",
  "created:workflows": "أنشأ سير عمل",
  "invited:invitations": "أضاف دعوة موظف",
  "accepted:invitations": "قبل دعوة الانضمام",
  "role_changed:memberships": "غيّر دور عضو",
  "disabled:memberships": "عطّل عضوية",
  "started:workflow_runs": "بدأ تنفيذ سير عمل",
  "completed:workflow_runs": "أنجز خطوة في سير عمل",
  "approved:workflow_runs": "وافق على خطوة في سير عمل",
  "rejected:workflow_runs": "رفض خطوة في سير عمل",
};

export default async function ActivityPage() {
  const { supabase, role, companyId } = await getContext();

  if (role !== "company_admin") {
    return (
      <div>
        <h1>السجل</h1>
        <p className="muted">هذه الصفحة لمدير الشركة فقط.</p>
      </div>
    );
  }

  const [res, members] = await Promise.all([
    supabase
      .from("activity_log")
      .select("id, actor_id, action, entity, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(50),
    getMembers(supabase, companyId),
  ]);
  const entries = (res.data ?? []) as unknown as Entry[];
  const names = new Map(members.map((m) => [m.id, m.name]));

  return (
    <div>
      <h1>السجل</h1>
      {res.error && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل السجل.
        </p>
      )}
      {entries.length === 0 ? (
        <p className="muted">لا توجد أحداث بعد.</p>
      ) : (
        <ul className="list">
          {entries.map((e) => (
            <li key={e.id} className="row">
              <div className="row__main">
                <strong>
                  {(e.actor_id && names.get(e.actor_id)) || "مستخدم"}{" "}
                  {phrases[`${e.action}:${e.entity}`] ?? `${e.action} ${e.entity}`}
                </strong>
                <span className="row__meta">
                  {new Date(e.created_at).toLocaleString("ar-EG", {
                    timeZone: "Africa/Cairo",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
