import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "./actions";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="appshell">
      <div className="container appshell__bar">
        <Link href="/app" className="logo">
          ORBIT
        </Link>
        <nav className="appnav" aria-label="التنقل داخل المنصة">
          <Link href="/app">نظرة عامة</Link>
          <Link href="/app/projects">المشروعات</Link>
          <Link href="/app/tasks">المهام</Link>
          <Link href="/app/workflows">سير العمل</Link>
          <Link href="/app/analytics">التحليلات</Link>
          <Link href="/app/team">الفريق</Link>
          <Link href="/app/plan">الاشتراك</Link>
          <Link href="/app/activity">السجل</Link>
        </nav>
        <form action={signOut}>
          <button className="btn btn--ghost" type="submit">
            تسجيل الخروج
          </button>
        </form>
      </div>
      <div className="container appshell__body">{children}</div>
    </div>
  );
}
