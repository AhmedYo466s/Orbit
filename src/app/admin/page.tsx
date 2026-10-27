import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminSetPlan } from "./actions";

type Overview = {
  total_companies: number;
  trial_companies: number;
  active_companies: number;
  canceled_companies: number;
  total_users: number;
  total_projects: number;
  total_tasks: number;
};
type Company = {
  id: string;
  name: string;
  created_at: string;
  plan_id: string | null;
  status: string | null;
  members: number;
  projects: number;
  tasks: number;
  last_activity: string | null;
};
type Audit = {
  id: string;
  company_id: string | null;
  action: string;
  detail: string;
  created_at: string;
};

const PLAN_OPTIONS = ["starter", "business", "enterprise"];
const statusLabels: Record<string, string> = {
  trial: "تجريبي",
  active: "نشط",
  canceled: "ملغي",
};

function fmt(s: string | null) {
  if (!s) return "لا يوجد";
  return new Date(s).toLocaleString("ar-EG", {
    timeZone: "Africa/Cairo",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { ok?: string; error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (isAdmin !== true) notFound();

  const [ovRes, coRes, auRes] = await Promise.all([
    supabase.rpc("admin_overview"),
    supabase.rpc("admin_companies"),
    supabase.rpc("admin_audit"),
  ]);
  const ov = ((ovRes.data ?? []) as unknown as Overview[])[0];
  const companies = (coRes.data ?? []) as unknown as Company[];
  const audit = (auRes.data ?? []) as unknown as Audit[];
  const names = new Map(companies.map((c) => [c.id, c.name]));

  const stats = [
    { label: "إجمالي الشركات", value: ov?.total_companies ?? 0 },
    { label: "في الفترة التجريبية", value: ov?.trial_companies ?? 0 },
    { label: "اشتراكات نشطة", value: ov?.active_companies ?? 0 },
    { label: "اشتراكات ملغية", value: ov?.canceled_companies ?? 0 },
    { label: "إجمالي المستخدمين", value: ov?.total_users ?? 0 },
    { label: "إجمالي المشروعات", value: ov?.total_projects ?? 0 },
    { label: "إجمالي المهام", value: ov?.total_tasks ?? 0 },
  ];

  const failed = ovRes.error || coRes.error || auRes.error;

  return (
    <div>
      <h1>إدارة المنصة</h1>
      {searchParams.ok === "plan" && (
        <p className="alert" role="status">
          تم تغيير الباقة.
        </p>
      )}
      {searchParams.error && (
        <p className="alert alert--danger" role="alert">
          تعذر تنفيذ العملية.
        </p>
      )}
      {failed && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل بعض البيانات.
        </p>
      )}
      <p className="muted">
        هذه الصفحة تعرض أعدادًا وبيانات اشتراك فقط، ولا تعرض محتوى الشركات.
        تتبع الأعطال التقنية غير مفعل بعد.
      </p>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <h2>الشركات</h2>
      {companies.length === 0 ? (
        <p className="muted">لا توجد شركات بعد.</p>
      ) : (
        <ul className="list">
          {companies.map((c) => (
            <li key={c.id} className="row">
              <div className="row__main">
                <strong>{c.name}</strong>
                <span className="row__meta">
                  أُنشئت: {fmt(c.created_at)} | الحالة:{" "}
                  {statusLabels[c.status ?? ""] ?? "غير محددة"}
                </span>
                <span className="row__meta">
                  الأعضاء: {c.members} | المشروعات: {c.projects} | المهام:{" "}
                  {c.tasks} | آخر نشاط: {fmt(c.last_activity)}
                </span>
              </div>
              <form action={adminSetPlan} className="row__form">
                <input type="hidden" name="company_id" value={c.id} />
                <select
                  name="plan"
                  defaultValue={c.plan_id ?? "starter"}
                  aria-label="الباقة"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button className="btn btn--ghost" type="submit">
                  تغيير الباقة
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2>سجل أحداث المنصة</h2>
      {audit.length === 0 ? (
        <p className="muted">لا توجد أحداث بعد.</p>
      ) : (
        <ul className="list">
          {audit.map((a) => (
            <li key={a.id} className="row">
              <div className="row__main">
                <strong>
                  {a.action === "plan_changed"
                    ? `تغيير باقة ${
                        (a.company_id && names.get(a.company_id)) || "شركة"
                      } إلى ${a.detail}`
                    : a.action}
                </strong>
                <span className="row__meta">{fmt(a.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
