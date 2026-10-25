import Link from "next/link";

const links = [
  { href: "/#features", label: "الميزات" },
  { href: "/#how", label: "طريقة العمل" },
  { href: "/#pricing", label: "الأسعار" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="logo" aria-label="ORBIT الصفحة الرئيسية">
          ORBIT
        </Link>
        <nav className="site-nav" aria-label="التنقل الرئيسي">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <Link href="/login" className="btn btn--ghost">
            تسجيل الدخول
          </Link>
          <Link href="/signup" className="btn btn--primary">
            إنشاء حساب
          </Link>
        </div>
      </div>
    </header>
  );
}
