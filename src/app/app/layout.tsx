import type { ReactNode } from "react";
import "@/components/shell.css";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let companyName = "";

  if (user) {
    const { data } = await supabase
      .from("memberships")
      .select("role, company_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const m = data as unknown as { role: string; company_id: string } | null;
    if (m) {
      role = m.role;
      const { data: c } = await supabase
        .from("companies")
        .select("name")
        .eq("id", m.company_id)
        .maybeSingle();
      companyName = (c as unknown as { name: string } | null)?.name ?? "";
    }
  }

  return (
    <AppShell role={role} companyName={companyName}>
      {children}
    </AppShell>
  );
}
