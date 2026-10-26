import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { errorMessages, roleLabels } from "@/lib/context";
import { createCompany, acceptInvitation } from "../actions";

type Invite = { id: string; company_name: string; role: string };

export default async function NewCompanyPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);
  if (data && data.length > 0) redirect("/app");

  const { data: inv } = await supabase.rpc("my_invitations");
  const invites = (inv ?? []) as unknown as Invite[];

  const error = searchParams.error ? errorMessages[searchParams.error] : "";

  return (
    <div className="auth">
      {error && (
        <p className="alert alert--danger" role="alert">
          {error}
        </p>
      )}

      {invites.length > 0 && (
        <>
          <h1>لديك دعوات</h1>
          <p className="muted">
            إذا كنت موظفًا في شركة، اقبل الدعوة بدل إنشاء شركة جديدة.
          </p>
          <ul className="list">
            {invites.map((i) => (
              <li key={i.id} className="row">
                <div className="row__main">
                  <strong>{i.company_name}</strong>
                  <span className="row__meta">
                    الدور: {roleLabels[i.role] ?? i.role}
                  </span>
                </div>
                <form action={acceptInvitation}>
                  <input type="hidden" name="id" value={i.id} />
                  <button className="btn btn--primary" type="submit">
                    قبول الدعوة
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </>
      )}

      <h1>{invites.length > 0 ? "أو أنشئ شركة جديدة" : "إنشاء مساحة الشركة"}</h1>
      <p className="muted">
        اكتب اسم شركتك. ستصبح مدير الشركة الأول ويمكنك لاحقًا دعوة الموظفين.
      </p>
      <form action={createCompany} className="form">
        <label className="field">
          <span>اسم الشركة</span>
          <input name="name" type="text" required minLength={2} maxLength={100} />
        </label>
        <button className="btn btn--primary" type="submit">
          إنشاء الشركة
        </button>
      </form>
    </div>
  );
}
