import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const roleLabels: Record<string, string> = {
  company_admin: "مدير الشركة",
  department_manager: "مدير قسم",
  employee: "موظف",
};
export const statusLabels: Record<string, string> = {
  todo: "جديدة",
  in_progress: "قيد التنفيذ",
  done: "مكتملة",
};
export const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
};
export const errorMessages: Record<string, string> = {
  invalid: "البيانات المدخلة غير صالحة.",
  forbidden: "ليست لديك صلاحية لهذا الإجراء.",
  failed: "تعذر تنفيذ العملية. حاول مرة أخرى.",
};

export async function getContext() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("memberships")
    .select("role, company_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const membership = data as unknown as {
    role: string;
    company_id: string;
  } | null;
  if (!membership) redirect("/app/new-company");

  const { data: companyData } = await supabase
    .from("companies")
    .select("name")
    .eq("id", membership.company_id)
    .maybeSingle();
  const company = companyData as unknown as { name: string } | null;

  return {
    supabase,
    user,
    role: membership.role,
    companyId: membership.company_id,
    companyName: company?.name ?? "",
  };
}

export type Member = { id: string; name: string; role: string; joined: string };

export async function getMembers(
  supabase: ReturnType<typeof createClient>,
  companyId: string
): Promise<Member[]> {
  const { data } = await supabase
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("company_id", companyId)
    .eq("status", "active");
  const rows = (data ?? []) as unknown as {
    user_id: string;
    role: string;
    created_at: string;
  }[];

  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in(
      "id",
      rows.map((r) => r.user_id)
    );
  const profiles = (profs ?? []) as unknown as {
    id: string;
    full_name: string;
  }[];
  const names = new Map<string, string>();
  profiles.forEach((p) => names.set(p.id, p.full_name || "مستخدم"));

  return rows.map((r) => ({
    id: r.user_id,
    role: r.role,
    joined: r.created_at,
    name: names.get(r.user_id) ?? "مستخدم",
  }));
}
