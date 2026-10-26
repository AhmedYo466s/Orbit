import {
  getContext,
  getMembers,
  roleLabels,
  errorMessages,
} from "@/lib/context";
import {
  inviteMember,
  revokeInvitation,
  changeMemberRole,
  disableMember,
} from "../actions";

type Invite = { id: string; email: string; role: string; created_at: string };

const messages: Record<string, string> = {
  ...errorMessages,
  exists: "هذا البريد مدعو بالفعل أو عضو في الشركة.",
};
const okMessages: Record<string, string> = {
  invited: "تمت إضافة الدعوة.",
  revoked: "أُلغيت الدعوة.",
  updated: "تم تحديث الدور.",
  disabled: "تم تعطيل العضو.",
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  const { supabase, user, role, companyId } = await getContext();
  const isAdmin = role === "company_admin";
  const members = await getMembers(supabase, companyId);

  let invites: Invite[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from("invitations")
      .select("id, email, role, created_at")
      .eq("company_id", companyId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    invites = (data ?? []) as unknown as Invite[];
  }

  const error = searchParams.error ? messages[searchParams.error] : "";
  const ok = searchParams.ok ? okMessages[searchParams.ok] : "";
  const editable = ["department_manager", "employee"];

  return (
    <div>
      <h1>الفريق</h1>
      {error && (
        <p className="alert alert--danger" role="alert">
          {error}
        </p>
      )}
      {ok && (
        <p className="alert" role="status">
          {ok}
        </p>
      )}

      {isAdmin && (
        <>
          <h2>دعوة موظف</h2>
          <p className="muted">
            لا يُرسل بريد تلقائيًا حاليًا. أخبر الموظف أن يسجل في الموقع بنفس
            البريد الإلكتروني، فتظهر له الدعوة ويقبلها. الدعوة صالحة 14 يومًا.
          </p>
          <form action={inviteMember} className="form form--inline">
            <label className="field">
              <span>البريد الإلكتروني</span>
              <input name="email" type="email" dir="ltr" required />
            </label>
            <label className="field">
              <span>الدور</span>
              <select name="role" defaultValue="employee">
                {editable.map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn--primary" type="submit">
              إضافة دعوة
            </button>
          </form>

          <h2>الدعوات المعلقة</h2>
          {invites.length === 0 ? (
            <p className="muted">لا توجد دعوات معلقة.</p>
          ) : (
            <ul className="list">
              {invites.map((i) => (
                <li key={i.id} className="row">
                  <div className="row__main">
                    <strong dir="ltr">{i.email}</strong>
                    <span className="row__meta">
                      {roleLabels[i.role] ?? i.role}
                    </span>
                  </div>
                  <form action={revokeInvitation}>
                    <input type="hidden" name="id" value={i.id} />
                    <button className="btn btn--ghost" type="submit">
                      إلغاء الدعوة
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <h2>الأعضاء</h2>
      <ul className="list">
        {members.map((m) => {
          const canEdit =
            isAdmin && m.id !== user.id && m.role !== "company_admin";
          return (
            <li key={m.id} className="row">
              <div className="row__main">
                <strong>{m.name}</strong>
                <span className="row__meta">
                  انضم في{" "}
                  {new Date(m.joined).toLocaleDateString("ar-EG", {
                    timeZone: "Africa/Cairo",
                  })}
                </span>
              </div>
              {canEdit ? (
                <>
                  <form action={changeMemberRole} className="row__form">
                    <input type="hidden" name="target" value={m.id} />
                    <select
                      name="role"
                      defaultValue={m.role}
                      aria-label="الدور"
                    >
                      {editable.map((r) => (
                        <option key={r} value={r}>
                          {roleLabels[r]}
                        </option>
                      ))}
                    </select>
                    <button className="btn btn--ghost" type="submit">
                      تحديث
                    </button>
                  </form>
                  <form action={disableMember}>
                    <input type="hidden" name="target" value={m.id} />
                    <button className="btn btn--ghost" type="submit">
                      تعطيل
                    </button>
                  </form>
                </>
              ) : (
                <span className="badge">{roleLabels[m.role] ?? m.role}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
