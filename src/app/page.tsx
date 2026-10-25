import Modules from "@/components/Modules";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";

export default function HomePage() {
  return (
    <>
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

      <div id="features">
        <Modules />
      </div>
      <div id="how">
        <HowItWorks />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <div id="faq">
        <Faq />
      </div>
    </>
  );
}
