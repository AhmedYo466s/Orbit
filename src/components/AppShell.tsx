"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Workflow,
  BarChart3,
  Users,
  CreditCard,
  ScrollText,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/app/actions";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
};
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: "العمل",
    items: [
      { href: "/app", label: "نظرة عامة", icon: LayoutDashboard },
      { href: "/app/projects", label: "المشروعات", icon: FolderKanban },
      { href: "/app/tasks", label: "المهام", icon: CheckSquare },
      { href: "/app/workflows", label: "سير العمل", icon: Workflow },
    ],
  },
  {
    title: "المتابعة",
    items: [
      {
        href: "/app/analytics",
        label: "التحليلات",
        icon: BarChart3,
        roles: ["company_admin", "department_manager"],
      },
      {
        href: "/app/activity",
        label: "السجل",
        icon: ScrollText,
        roles: ["company_admin"],
      },
    ],
  },
  {
    title: "الشركة",
    items: [
      { href: "/app/team", label: "الفريق", icon: Users },
      {
        href: "/app/plan",
        label: "الاشتراك",
        icon: CreditCard,
        roles: ["company_admin"],
      },
    ],
  },
];

export default function AppShell({
  role,
  companyName,
  children,
}: {
  role: string | null;
  companyName: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const visible = groups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => !i.roles || (role !== null && i.roles.includes(role))
      ),
    }))
    .filter((g) => g.items.length > 0);

  function isActive(href: string) {
    return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
  }

  return (
    <div className="shell">
      <header className="shell__top">
        <Link href="/app" className="logo">
          ORBIT
        </Link>
        {companyName && <span className="shell__company">{companyName}</span>}
        <button
          type="button"
          className="shell__toggle"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          aria-controls="shell-side"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </header>

      <aside
        id="shell-side"
        className={open ? "shell__side is-open" : "shell__side"}
      >
        <nav aria-label="التنقل داخل المنصة">
          {visible.map((g) => (
            <div key={g.title} style={{ marginBottom: "var(--space-4)" }}>
              <p className="shell__group-title">{g.title}</p>
              {g.items.map((i) => {
                const Icon = i.icon;
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className="shell__item"
                    aria-current={isActive(i.href) ? "page" : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {i.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <form action={signOut}>
          <button type="submit" className="shell__item">
            <LogOut size={18} aria-hidden="true" />
            تسجيل الخروج
          </button>
        </form>
      </aside>

      <main className="shell__content">{children}</main>
    </div>
  );
}
