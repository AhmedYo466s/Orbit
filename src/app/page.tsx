import Link from "next/link";
import "@/components/site.css";
import Modules from "@/components/Modules";

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link href="/" className="logo" aria-label="ORBIT الصفحة الرئيسية">
            ORBIT
          </Link>
          <div className="site-header__actions">
            <button
              type="button"
              className="btn btn--ghost"
              disabled
              title="قيد الإعداد"
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled
              title="قيد الإعداد"
            >
              إنشاء حساب
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>مكان واحد لمهام الشركة وسير العمل والتقارير</h1>
            <p>
              ORBIT منصة تجمع المهام والمشروعات ومسارات العمل وتقارير الشركة،
              لتعرف ما الذي يحدث في عملياتك وأين تحتاج إلى تدخل.
            </p>
            <p className="hero__note">
              التسجيل وتسجيل الدخول قيد الإعداد وسيتوفران في مرحلة لاحقة.
            </p>
          </div>
        </section>

        <Modules />
      </main>
    </>
  );
}
