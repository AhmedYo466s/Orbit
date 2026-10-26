import { getContext, getMembers, roleLabels } from "@/lib/context";

export default async function TeamPage() {
  const { supabase, companyId } = await getContext();
  const members = await getMembers(supabase, companyId);

  return (
    <div>
      <h1>الفريق</h1>
      <p className="muted">
        دعوة الموظفين وتغيير الأدوار قيد الإعداد وستُضاف في دفعة لاحقة.
      </p>
      <ul className="list">
        {members.map((m) => (
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
            <span className="badge">{roleLabels[m.role] ?? m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
