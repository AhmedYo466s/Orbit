import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { errorMessages } from "@/lib/context";
import { createCompany } from "../actions";

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

  const error = searchParams.error ? errorMessages[searchParams.error] : "";

  return (
    <div className="auth">
      <h1>إنشاء مساحة الشركة</h1>
      <p className="muted">
        اكتب اسم شركتك. ستصبح مدير الشركة الأول ويمكنك لاحقًا دعوة الموظفين.
      </p>
      <form action={createCompany} className="form">
        <label className="field">
          <span>اسم الشركة</span>
          <input name="name" type="text" required minLength={2} maxLength={100} />
        </label>
        {error && (
          <p className="alert alert--danger" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn--primary" type="submit">
          إنشاء الشركة
        </button>
      </form>
    </div>
  );
}
