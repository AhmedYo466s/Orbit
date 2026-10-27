import "@/components/workflow.css";
import { getContext } from "@/lib/context";

type Plan = {
  id: string;
  name: string;
  monthly_price: number | null;
  yearly_price: number | null;
  max_users: number | null;
  max_projects: number | null;
  max_workflows: number | null;
};
type Sub = { plan_id: string; status: string; trial_ends_at: string | null };

const ORDER = ["starter", "business", "enterprise"];
const statusLabels: Record<string, string> = {
  trial: "تجريبي",
  active: "نشط",
  canceled: "ملغي",
};

function Usage({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <li className="row">
      <div className="row__main" style={{ flex: 1 }}>
        <strong>{label}</strong>
        <span className="row__meta">
          {used} من {limit ?? "بلا حد"}
        </span>
        {limit ? (
          <div className="bar" role="img" aria-label={`${pct}%`}>
            <span style={{ width: `${pct}%` }} />
          </div>
        ) : null}
      </div>
    </li>
  );
}

function lim(v: number | null) {
  return v === null ? "بلا حد" : String(v);
}

export default async function PlanPage() {
  const { supabase, role, companyId } = await getContext();

  if (role !== "company_admin") {
    return (
      <div>
        <h1>الاشتراك</h1>
        <p className="muted">هذه الصفحة لمدير الشركة فقط.</p>
      </div>
    );
  }

  const head = { count: "exact", head: true } as const;
  const [subRes, plansRes, members, projects, workflows, pending] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan_id, status, trial_ends_at")
        .eq("company_id", companyId)
        .maybeSingle(),
      supabase
        .from("plans")
        .select(
          "id, name, monthly_price, yearly_price, max_users, max_projects, max_workflows"
        )
        .eq("is_active", true),
      supabase
        .from("memberships")
        .select("id", head)
        .eq("company_id", companyId)
        .eq("status", "active"),
      supabase.from("projects").select("id", head).eq("company_id", companyId),
      supabase.from("workflows").select("id", head).eq("company_id", companyId),
      supabase
        .from("invitations")
        .select("id", head)
        .eq("company_id", companyId)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString()),
    ]);

  const sub = subRes.data as unknown as Sub | null;
  const plans = ((plansRes.data ?? []) as unknown as Plan[]).sort(
    (a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)
  );
  const current = plans.find((p) => p.id === sub?.plan_id);

  return (
    <div>
      <h1>الاشتراك</h1>
      {(subRes.error || plansRes.error) && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل بيانات الاشتراك.
        </p>
      )}
      <p className="alert" role="status">
        الاشتراكات في وضع تجريبي، ولا يوجد تحصيل مالي. يتم تغيير الباقة حاليًا
        من قبل إدارة ORBIT.
      </p>

      {sub && (
        <p>
          الباقة الحالية: <strong>{current?.name ?? sub.plan_id}</strong> | الحالة:{" "}
          {statusLabels[sub.status] ?? sub.status}
          {sub.trial_ends_at
            ? ` | تنتهي التجربة في ${new Date(sub.trial_ends_at).toLocaleDateString(
                "ar-EG",
                { timeZone: "Africa/Cairo" }
              )}`
            : ""}
        </p>
      )}

      {current && (
        <>
          <h2>الاستهلاك</h2>
          <ul className="list">
            <Usage
              label="الأعضاء والدعوات المعلقة"
              used={(members.count ?? 0) + (pending.count ?? 0)}
              limit={current.max_users}
            />
            <Usage
              label="المشروعات"
              used={projects.count ?? 0}
              limit={current.max_projects}
            />
            <Usage
              label="مسارات العمل"
              used={workflows.count ?? 0}
              limit={current.max_workflows}
            />
          </ul>
        </>
      )}

      <h2>الباقات المتاحة</h2>
      <ul className="list">
        {plans.map((p) => (
          <li key={p.id} className="row">
            <div className="row__main">
              <strong>{p.name}</strong>
              <span className="row__meta">
                الأعضاء: {lim(p.max_users)} | المشروعات: {lim(p.max_projects)} |
                مسارات العمل: {lim(p.max_workflows)}
              </span>
              <span className="row__meta">
                {p.monthly_price !== null
                  ? `السعر الشهري: ${p.monthly_price}`
                  : "السعر لم يُحدد بعد"}
              </span>
            </div>
            {p.id === sub?.plan_id && <span className="badge">الحالية</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
