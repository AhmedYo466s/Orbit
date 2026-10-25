const plans = [
  {
    name: "Starter",
    text: "للشركات الصغيرة التي تبدأ بتنظيم مهامها ومشروعاتها.",
  },
  {
    name: "Business",
    text: "للشركات المتوسطة التي تحتاج إلى فرق أكبر ومسارات عمل وتقارير.",
  },
  {
    name: "Enterprise",
    text: "للشركات ذات الاحتياجات الخاصة، وتُحدد حدودها وميزاتها حسب الحالة.",
  },
];

export default function Pricing() {
  return (
    <section className="modules" aria-labelledby="pricing-title">
      <div className="container">
        <h2 id="pricing-title" className="modules__title">
          الباقات
        </h2>
        <p className="modules__lead">
          أسماء الباقات مبدئية وقابلة للتغيير. لم تُحدد الأسعار وحدود
          الاستخدام بعد، ولا يوجد تحصيل مالي حاليًا.
        </p>
        <ul className="modules__list">
          {plans.map((p) => (
            <li key={p.name} className="module">
              <div className="module__head">
                <h3>{p.name}</h3>
                <span className="status">السعر لاحقًا</span>
              </div>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
