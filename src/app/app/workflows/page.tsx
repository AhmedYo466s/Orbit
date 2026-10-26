import Link from "next/link";
import { getContext } from "@/lib/context";
import { workflowStatusLabels, workflowMessages } from "@/lib/workflow";
import { createWorkflow } from "./actions";

type Wf = { id: string; name: string; description: string; status: string };

export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { supabase, role, companyId } = await getContext();

  const [wfRes, stepsRes] = await Promise.all([
    supabase
      .from("workflows")
      .select("id, name, description, status")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("workflow_steps")
      .select("workflow_id")
      .eq("company_id", companyId),
  ]);

  const workflows = (wfRes.data ?? []) as unknown as Wf[];
  const stepRows = (stepsRes.data ?? []) as unknown as { workflow_id: string }[];
  const counts = new Map<string, number>();
  stepRows.forEach((s) =>
    counts.set(s.workflow_id, (counts.get(s.workflow_id) ?? 0) + 1)
  );
  const error = searchParams.error ? workflowMessages[searchParams.error] : "";

  return (
    <div>
      <h1>سير العمل</h1>
      {error && (
        <p className="alert alert--danger" role="alert">
          {error}
        </p>
      )}
      {wfRes.error && (
        <p className="alert alert--danger" role="alert">
          تعذر تحميل مسارات العمل.
        </p>
      )}

      {role !== "employee" ? (
        <form action={createWorkflow} className="form form--inline">
          <label className="field">
            <span>اسم سير العمل</span>
            <input name="name" type="text" required minLength={2} maxLength={120} />
          </label>
          <label className="field">
            <span>الوصف (اختياري)</span>
            <textarea name="description" maxLength={1000} />
          </label>
          <button className="btn btn--primary" type="submit">
            إنشاء سير عمل
          </button>
        </form>
      ) : (
        <p className="muted">إنشاء مسارات العمل متاح لمدير الشركة ومدير القسم.</p>
      )}

      <h2>المسارات</h2>
      {workflows.length === 0 ? (
        <p className="muted">لا توجد مسارات عمل بعد.</p>
      ) : (
        <ul className="list">
          {workflows.map((w) => (
            <li key={w.id} className="row">
              <div className="row__main">
                <Link href={`/app/workflows/${w.id}`}>
                  <strong>{w.name}</strong>
                </Link>
                <span className="row__meta">
                  {counts.get(w.id) ?? 0} خطوات
                  {w.description ? ` | ${w.description}` : ""}
                </span>
              </div>
              <span className="badge">
                {workflowStatusLabels[w.status] ?? w.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
