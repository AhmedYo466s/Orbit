"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getContext } from "@/lib/context";

const UUID = /^[0-9a-f-]{36}$/i;

function text(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function failCode(message: string) {
  if (message.includes("draft only")) return "locked";
  if (message.includes("no steps")) return "nosteps";
  if (message.includes("not active")) return "inactive";
  if (message.includes("not running")) return "finished";
  if (message.includes("forbidden")) return "forbidden";
  return "failed";
}

export async function createWorkflow(formData: FormData) {
  const { supabase, role, companyId } = await getContext();
  if (role === "employee") redirect("/app/workflows?error=forbidden");

  const name = text(formData.get("name"));
  const description = text(formData.get("description"));
  if (name.length < 2 || name.length > 120 || description.length > 1000) {
    redirect("/app/workflows?error=invalid");
  }

  const { data, error } = await supabase.rpc("create_workflow", {
    p_company: companyId,
    p_name: name,
    p_description: description,
  });
  const id = String(data ?? "");
  if (error || !UUID.test(id)) redirect("/app/workflows?error=failed");

  revalidatePath("/app/workflows");
  redirect(`/app/workflows/${id}`);
}

export async function addStep(formData: FormData) {
  const { supabase } = await getContext();
  const wid = text(formData.get("workflow_id"));
  if (!UUID.test(wid)) redirect("/app/workflows?error=invalid");

  const name = text(formData.get("name"));
  const assignee = text(formData.get("assignee_id"));
  const approval = formData.get("approval") === "on";
  if (name.length < 2 || name.length > 120 || (assignee && !UUID.test(assignee))) {
    redirect(`/app/workflows/${wid}?error=invalid`);
  }

  const { error } = await supabase.rpc("add_step", {
    p_workflow: wid,
    p_name: name,
    p_assignee: assignee || null,
    p_approval: approval,
  });
  if (error) redirect(`/app/workflows/${wid}?error=${failCode(error.message)}`);

  revalidatePath(`/app/workflows/${wid}`);
  revalidatePath("/app/workflows");
  redirect(`/app/workflows/${wid}?ok=step`);
}

export async function removeLastStep(formData: FormData) {
  const { supabase } = await getContext();
  const wid = text(formData.get("workflow_id"));
  if (!UUID.test(wid)) redirect("/app/workflows?error=invalid");

  const { error } = await supabase.rpc("remove_last_step", { p_workflow: wid });
  if (error) redirect(`/app/workflows/${wid}?error=${failCode(error.message)}`);

  revalidatePath(`/app/workflows/${wid}`);
  revalidatePath("/app/workflows");
  redirect(`/app/workflows/${wid}?ok=removed`);
}

export async function setWorkflowStatus(formData: FormData) {
  const { supabase } = await getContext();
  const wid = text(formData.get("workflow_id"));
  const status = text(formData.get("status"));
  if (!UUID.test(wid)) redirect("/app/workflows?error=invalid");
  if (!["active", "paused"].includes(status)) {
    redirect(`/app/workflows/${wid}?error=invalid`);
  }

  const { error } = await supabase.rpc("set_workflow_status", {
    p_workflow: wid,
    p_status: status,
  });
  if (error) redirect(`/app/workflows/${wid}?error=${failCode(error.message)}`);

  revalidatePath(`/app/workflows/${wid}`);
  revalidatePath("/app/workflows");
  redirect(`/app/workflows/${wid}?ok=status`);
}

export async function startRun(formData: FormData) {
  const { supabase } = await getContext();
  const wid = text(formData.get("workflow_id"));
  if (!UUID.test(wid)) redirect("/app/workflows?error=invalid");

  const title = text(formData.get("title"));
  if (title.length < 2 || title.length > 150) {
    redirect(`/app/workflows/${wid}?error=invalid`);
  }

  const { error } = await supabase.rpc("start_run", {
    p_workflow: wid,
    p_title: title,
  });
  if (error) redirect(`/app/workflows/${wid}?error=${failCode(error.message)}`);

  revalidatePath(`/app/workflows/${wid}`);
  revalidatePath("/app/activity");
  redirect(`/app/workflows/${wid}?ok=started`);
}

export async function decideStep(formData: FormData) {
  const { supabase } = await getContext();
  const wid = text(formData.get("workflow_id"));
  const runId = text(formData.get("run_id"));
  const decision = text(formData.get("decision"));
  const note = text(formData.get("note"));
  if (!UUID.test(wid)) redirect("/app/workflows?error=invalid");
  if (
    !UUID.test(runId) ||
    !["approve", "reject"].includes(decision) ||
    note.length > 500
  ) {
    redirect(`/app/workflows/${wid}?error=invalid`);
  }

  const { error } = await supabase.rpc("decide_step", {
    p_run: runId,
    p_decision: decision,
    p_note: note,
  });
  if (error) redirect(`/app/workflows/${wid}?error=${failCode(error.message)}`);

  revalidatePath(`/app/workflows/${wid}`);
  revalidatePath("/app/activity");
  redirect(`/app/workflows/${wid}?ok=decided`);
}
