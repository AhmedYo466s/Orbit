import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/app/actions";

export const metadata = { title: "إدارة ORBIT" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="appshell">
      <div className="container appshell__bar">
        <Link href="/admin" className="logo">
          ORBIT
        </Link>
        <nav className="appnav" aria-label="إدارة المنصة">
          <Link href="/admin">إدارة المنصة</Link>
          <Link href="/app">العودة للمنصة</Link>
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
