const steps = [
  {
    name: "إنشاء مساحة الشركة",
    text: "يسجل مدير الشركة ويحدد اسم الشركة، فتُنشأ مساحة خاصة ببيانات شركته فقط.",
  },
  {
    name: "دعوة الفريق",
    text: "يدعو المدير الموظفين بالبريد الإلكتروني ويحدد دور كل واحد منهم.",
  },
  {
    name: "تنظيم العمل",
    text: "تُنشأ المشروعات والمهام ومسارات العمل، ويُعيَّن المسؤول والموعد لكل منها.",
  },
  {
    name: "المتابعة",
    text: "تعرض لوحة التحكم والتقارير ما أُنجز وما تأخر وأين تحتاج إلى تدخل.",
  },
];

export default function HowItWorks() {
  return (
    <section className="modules" aria-labelledby="how-title">
      <div className="container">
        <h2 id="how-title" className="modules__title">
          طريقة العمل
        </h2>
        <p className="modules__lead">
          هذه هي الطريقة المخطط لها لاستخدام ORBIT. لم يُنفذ منها شيء بعد.
        </p>
        <ol className="modules__list">
          {steps.map((s, i) => (
            <li key={s.name} className="module">
              <div className="module__head">
                <h3>{s.name}</h3>
                <span className="status">الخطوة {i + 1}</span>
              </div>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
