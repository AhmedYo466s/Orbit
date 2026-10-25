import Link from "next/link";
import type { ReactNode } from "react";

export default function StaticPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="static-page">
      <div className="container">
        <h1>{title}</h1>
        {children}
        <p>
          <Link href="/">العودة إلى الصفحة الرئيسية</Link>
        </p>
      </div>
    </section>
  );
}
