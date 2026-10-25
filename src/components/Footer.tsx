import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span className="site-footer__brand">ORBIT</span>
        <nav className="site-footer__nav" aria-label="روابط التذييل">
          <Link href="/privacy">سياسة الخصوصية</Link>
          <Link href="/terms">شروط الاستخدام</Link>
          <Link href="/contact">التواصل</Link>
        </nav>
      </div>
      <div className="container">
        <p className="site-footer__note">ORBIT قيد التطوير ولم يُطلق بعد.</p>
      </div>
    </footer>
  );
}
