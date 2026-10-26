import { notFound } from "next/navigation";
import Link from "next/link";
import "@/components/workflow.css";
import { getContext, getMembers } from "@/lib/context";
import {
  workflowStatusLabels,
  runStatusLabels,
  eventLabels,
  workflowMessages,
  workflowOk,
} from "@/lib/workflow";
import {
  addStep,
  removeLastStep,
  setWorkflowStatus,
  startRun,
  decideStep,
} from "../actions";

const UUID = /^[0-9a-f-]{36}$/i;

type Wf = { id: string; name: string; description: string; status: string };
type Step = {
  id: string;
  step_order: number;
  name: string;
  assignee_id: string | null;
  requires_approval: boolean;
};
type Run = {
  id: string;
  title: string;
  status: string;
  current_step: number;
  created_at: string;
};
type Ev = {
  id: string;
  run_id: string;
  step_order: number | null;
  action: string;
  actor_id: string | null;
  note: string;
  created_at: string;
};

function fmt(s: string) {
  return new Date(s).toLocaleString("ar-EG", {
    timeZone: "Africa/Cairo",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function WorkflowPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; ok?: string };
}) {
  if (!UUID.test(params.id)) notFound();
  const { supabase, user, role, companyId } = await getContext();

  const { data: wfData } = await supabase
    .from("workflows")
    .select("id, name, description, status")
    .eq("id", params.id)
    .eq("company_id", companyId)
    .maybeSingle();
  const wf = wfData as unknown as Wf | null;
  if (!wf) notFound();

  const [stepsRes, runsRes, members] = await Promise.all([
    supabase
      .from("workflow_steps")
      .select("id, step_order, name, assignee_id, requires_approval")
      .eq("workflow_id", wf.id)
      .order("step_order", { ascending: true }),
    supabase
      .from("workflow_runs")
      .select("id, title, status, current_step, created_at")
      .eq("workflow_id", wf.id)
      .order("created_at", { ascending: false })
      .limit(20),
    getMembers(supabase, companyId),
  ]);

  const steps = (stepsRes.data ?? []) as unknown as Step[];
  const runs = (runsRes.data ?? []) as unknown as Run[];

  let events: Ev[] = [];
  if (runs.length > 0) {
    const { data } = await supabase
      .from("workflow_run_events")
      .select("id, run_id, step_order, action, actor_id, note, created_at")
      .in(
        "run_id",
        runs.map((r) => r.id)
      )
      .order("created_at", { ascending: true });
    events = (data ?? []) as unknown as Ev[];
  }

  const names = new Map(members.map((m) => [m.id, m.name]));
  const canManage = role !== "employee";
  const error = searchParams.error ? workflowMessages[searchParams.error] : "";
  const ok = searchParams.ok ? workflowOk[searchParams.ok] : "";

  return (
    <div>
      <p>
        <Link href="/app/workflows">العودة إلى سير العمل</Link>
      </p>
      <h1>
        {wf.name}{" "}
        <span className="badge">
          {workflowStatusLabels[wf.status] ?? wf.status}
        </span>
      </h1>
      {wf.description && <p className="muted">{wf.description}</p>}
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

      {canManage && (wf.status === "draft" || wf.status === "paused") && (
        <form action={setWorkflowStatus} className="row__form">
          <input type="hidden" name="workflow_id" value={wf.id} />
          <input type="hidden" name="status" value="active" />
          <button className="btn btn--primary" type="submit">
            تفعيل سير العمل
          </button>
        </form>
      )}
      {canManage && wf.status === "active" && (
        <form action={setWorkflowStatus} className="row__form">
          <input type="hidden" name="workflow_id" value={wf.id} />
          <input type="hidden" name="status" value="paused" />
          <button className="btn btn--ghost" type="submit">
            إيقاف سير العمل
          </button>
        </form>
      )}

      <h2>الخطوات</h2>
      {steps.length === 0 ? (
        <p className="muted">لا توجد خطوات بعد.</p>
      ) : (
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong>
              <span className="row__meta">
                {" "}
                المسؤول:{" "}
                {s.assignee_id
                  ? names.get(s.assignee_id) ?? "مستخدم"
                  : "مدير الشركة أو القسم"}
                {s.requires_approval ? " | تتطلب موافقة" : ""}
              </span>
            </li>
          ))}
        </ol>
      )}

      {canManage && wf.status === "draft" && (
        <>
          <h2>إضافة خطوة</h2>
          <form action={addStep} className="form form--inline">
            <input type="hidden" name="workflow_id" value={wf.id} />
            <label className="field">
              <span>اسم الخطوة</span>
              <input name="name" type="text" required minLength={2} maxLength={120} />
            </label>
            <label className="field">
              <span>المسؤول</span>
              <select name="assignee_id" defaultValue="">
                <option value="">مدير الشركة أو القسم</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="check">
              <input type="checkbox" name="approval" /> تتطلب موافقة
            </label>
            <button className="btn btn--primary" type="submit">
              إضافة الخطوة
            </button>
          </form>
          {steps.length > 0 && (
            <form action={removeLastStep} className="row__form">
              <input type="hidden" name="workflow_id" value={wf.id} />
              <button className="btn btn--ghost" type="submit">
                حذف آخر خطوة
              </button>
            </form>
          )}
        </>
      )}
      {canManage && wf.status !== "draft" && (
        <p className="muted">
          تعديل الخطوات متاح في حالة المسودة فقط، حتى لا تتأثر التنفيذات الجارية.
        </p>
      )}

      {wf.status === "active" && (
        <>
          <h2>بدء تنفيذ</h2>
          <form action={startRun} className="form form--inline">
            <input type="hidden" name="workflow_id" value={wf.id} />
            <label className="field">
              <span>عنوان التنفيذ</span>
              <input name="title" type="text" required minLength={2} maxLength={150} />
            </label>
            <button className="btn btn--primary" type="submit">
              بدء التنفيذ
            </button>
          </form>
        </>
      )}

      <h2>التنفيذات</h2>
      {runs.length === 0 ? (
        <p className="muted">لا توجد تنفيذات بعد.</p>
      ) : (
        <div>
          {runs.map((r) => {
            const current = steps.find((s) => s.step_order === r.current_step);
            const canAct =
              r.status === "running" &&
              !!current &&
              (canManage || current.assignee_id === user.id);
            return (
              <div key={r.id} className="run">
                <div className="run__head">
                  <div className="row__main">
                    <strong>{r.title}</strong>
                    <span className="row__meta">
                      {fmt(r.created_at)}
                      {r.status === "running" && current
                        ? ` | الخطوة الحالية: ${current.name}`
                        : ""}
                    </span>
                  </div>
                  <span
                    className={
                      r.status === "failed" ? "badge badge--late" : "badge"
                    }
                  >
                    {runStatusLabels[r.status] ?? r.status}
                  </span>
                </div>
                {canAct && current && (
                  <form action={decideStep} className="row__form">
                    <input type="hidden" name="run_id" value={r.id} />
                    <input type="hidden" name="workflow_id" value={wf.id} />
                    <input
                      name="note"
                      type="text"
                      maxLength={500}
                      placeholder="ملاحظة (اختياري)"
                      aria-label="ملاحظة"
                    />
                    <button
                      className="btn btn--primary"
                      type="submit"
                      name="decision"
                      value="approve"
                    >
                      {current.requires_approval ? "موافقة" : "إنجاز الخطوة"}
                    </button>
                    {current.requires_approval && (
                      <button
                        className="btn btn--ghost"
                        type="submit"
                        name="decision"
                        value="reject"
                      >
                        رفض
                      </button>
                    )}
                  </form>
                )}
                <ul className="run__events">
                  {events
                    .filter((e) => e.run_id === r.id)
                    .map((e) => (
                      <li key={e.id}>
                        {(e.actor_id && names.get(e.actor_id)) || "مستخدم"}{" "}
                        {eventLabels[e.action] ?? e.action}
                        {e.step_order ? ` (الخطوة ${e.step_order})` : ""}
                        {e.note ? `: ${e.note}` : ""} | {fmt(e.created_at)}
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
