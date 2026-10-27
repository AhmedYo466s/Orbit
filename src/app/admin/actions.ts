"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;
const PLANS = ["starter", "business", "enterprise"];

function text(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

export async function adminSetPlan(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company = text(formData.get("company_id"));
  const plan = text(formData.get("plan"));
  if (!UUID.test(company) || !PLANS.includes(plan)) {
    redirect("/admin?error=invalid");
  }

  const { error } = await supabase.rpc("admin_set_plan", {
    p_company: company,
    p_plan: plan,
  });
  if (error) redirect("/admin?error=failed");

  revalidatePath("/admin");
  redirect("/admin?ok=plan");
}
