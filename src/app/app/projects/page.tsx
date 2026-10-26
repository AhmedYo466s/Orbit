import { getContext, errorMessages } from "@/lib/context";
import { createProject } from "../actions";

type Project = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { supabase, role, companyId } = await getContext();
  const { data, error: loadError } = await supabase
    .from("projects")
    .select("id, name, description, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  const projects = (data ?? []) as unknown as Project[];
  const error = searchParams.error ? errorMessages[searchParams.error] : "";

  return (
    <div>
      <h1>المشروعات</h1>
      {error && (
        <p className="alert alert--danger" role="alert">
          {error}
        </p>
      )}
      {loadError && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل المشروعات.
        </p>
      )}

      {role !== "employee" ? (
        <form action={createProject} className="form form--inline">
          <label className="field">
            <span>اسم المشروع</span>
            <input name="name" type="text" required minLength={2} maxLength={120} />
          </label>
          <label className="field">
            <span>الوصف (اختياري)</span>
            <textarea name="description" maxLength={1000} />
          </label>
          <button className="btn btn--primary" type="submit">
            إنشاء مشروع
          </button>
        </form>
      ) : (
        <p className="muted">إنشاء المشروعات متاح لمدير الشركة ومدير القسم.</p>
      )}

      {projects.length === 0 ? (
        <p className="muted">لا توجد مشروعات بعد.</p>
      ) : (
        <ul className="list">
          {projects.map((p) => (
            <li key={p.id} className="row">
              <div className="row__main">
                <strong>{p.name}</strong>
                {p.description && <span className="row__meta">{p.description}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
