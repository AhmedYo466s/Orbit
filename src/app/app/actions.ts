"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getContext } from "@/lib/context";

const STATUSES = ["todo", "in_progress", "done"];
const PRIORITIES = ["low", "medium", "high"];
const INVITE_ROLES = ["department_manager", "employee"];
const UUID = /^[0-9a-f-]{36}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createCompany(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = text(formData.get("name"));
  if (name.length < 2 || name.length > 100) {
    redirect("/app/new-company?error=invalid");
  }
  const { error } = await supabase.rpc("create_company", {
    company_name: name,
  });
  if (error) redirect("/app/new-company?error=failed");
  redirect("/app");
}

export async function acceptInvitation(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = text(formData.get("id"));
  if (!UUID.test(id)) redirect("/app/new-company?error=invalid");

  const { error } = await supabase.rpc("accept_invitation", { inv: id });
  if (error) redirect("/app/new-company?error=failed");

  revalidatePath("/app");
  redirect("/app");
}

export async function createProject(formData: FormData) {
  const { supabase, user, role, companyId } = await getContext();
  if (role === "employee") redirect("/app/projects?error=forbidden");

  const name = text(formData.get("name"));
  const description = text(formData.get("description"));
  if (name.length < 2 || name.length > 120 || description.length > 1000) {
    redirect("/app/projects?error=invalid");
  }
  const { error } = await supabase.from("projects").insert({
    company_id: companyId,
    name,
    description,
    created_by: user.id,
  });
  if (error) redirect("/app/projects?error=failed");

  revalidatePath("/app/projects");
  revalidatePath("/app");
  redirect("/app/projects");
}

export async function createTask(formData: FormData) {
  const { supabase, user, companyId } = await getContext();

  const title = text(formData.get("title"));
  const projectId = text(formData.get("project_id"));
  const priority = text(formData.get("priority")) || "medium";
  const dueDate = text(formData.get("due_date"));
  const assignee = text(formData.get("assignee_id"));

  if (
    title.length < 2 ||
    title.length > 200 ||
    !UUID.test(projectId) ||
    !PRIORITIES.includes(priority) ||
    (dueDate && !DATE.test(dueDate)) ||
    (assignee && !UUID.test(assignee))
  ) {
    redirect("/app/tasks?error=invalid");
  }

  const { error } = await supabase.from("tasks").insert({
    company_id: companyId,
    project_id: projectId,
    title,
    priority,
    due_date: dueDate || null,
    assignee_id: assignee || null,
    created_by: user.id,
  });
  if (error) redirect("/app/tasks?error=failed");

  revalidatePath("/app/tasks");
  revalidatePath("/app");
  redirect("/app/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const { supabase, companyId } = await getContext();
  const id = text(formData.get("id"));
  const status = text(formData.get("status"));
  if (!UUID.test(id) || !STATUSES.includes(status)) {
    redirect("/app/tasks?error=invalid");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
    .select("id");
  if (error || !data || data.length === 0) {
    redirect("/app/tasks?error=forbidden");
  }

  revalidatePath("/app/tasks");
  revalidatePath("/app");
  redirect("/app/tasks");
}

export async function inviteMember(formData: FormData) {
  const { supabase, role, companyId } = await getContext();
  if (role !== "company_admin") redirect("/app/team?error=forbidden");

  const email = text(formData.get("email")).toLowerCase();
  const inviteRole = text(formData.get("role"));
  if (email.length > 254 || !EMAIL.test(email) || !INVITE_ROLES.includes(inviteRole)) {
    redirect("/app/team?error=invalid");
  }

  const { error } = await supabase.rpc("invite_member", {
    cid: companyId,
    invite_email: email,
    invite_role: inviteRole,
  });
  if (error) {
    const dup =
      error.message.includes("already member") ||
      error.message.includes("duplicate key");
    redirect(`/app/team?error=${dup ? "exists" : "failed"}`);
  }

  revalidatePath("/app/team");
  revalidatePath("/app/activity");
  redirect("/app/team?ok=invited");
}

export async function revokeInvitation(formData: FormData) {
  const { supabase, role } = await getContext();
  if (role !== "company_admin") redirect("/app/team?error=forbidden");

  const id = text(formData.get("id"));
  if (!UUID.test(id)) redirect("/app/team?error=invalid");

  const { error } = await supabase.rpc("revoke_invitation", { inv: id });
  if (error) redirect("/app/team?error=failed");

  revalidatePath("/app/team");
  redirect("/app/team?ok=revoked");
}

export async function changeMemberRole(formData: FormData) {
  const { supabase, role, companyId } = await getContext();
  if (role !== "company_admin") redirect("/app/team?error=forbidden");

  const target = text(formData.get("target"));
  const newRole = text(formData.get("role"));
  if (!UUID.test(target) || !INVITE_ROLES.includes(newRole)) {
    redirect("/app/team?error=invalid");
  }

  const { error } = await supabase.rpc("change_member_role", {
    cid: companyId,
    target,
    new_role: newRole,
  });
  if (error) redirect("/app/team?error=failed");

  revalidatePath("/app/team");
  revalidatePath("/app/activity");
  redirect("/app/team?ok=updated");
}

export async function disableMember(formData: FormData) {
  const { supabase, role, companyId } = await getContext();
  if (role !== "company_admin") redirect("/app/team?error=forbidden");

  const target = text(formData.get("target"));
  if (!UUID.test(target)) redirect("/app/team?error=invalid");

  const { error } = await supabase.rpc("disable_member", {
    cid: companyId,
    target,
  });
  if (error) redirect("/app/team?error=failed");

  revalidatePath("/app/team");
  revalidatePath("/app/activity");
  redirect("/app/team?ok=disabled");
}
