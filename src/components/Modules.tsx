import "./sections.css";

const modules = [
  {
    name: "لوحة التحكم",
    text: "ملخص للمشروعات والمهام المفتوحة والمتأخرة وآخر النشاطات.",
  },
  {
    name: "سير العمل",
    text: "مسارات من خطوات وشروط وموافقات، مثل مراجعة طلب شراء واعتماده.",
  },
  {
    name: "المهام والمشروعات",
    text: "إنشاء المهام وتعيين المسؤولين وتحديد الأولوية والمواعيد.",
  },
  {
    name: "التكاملات",
    text: "ربط البرامج الخارجية المدعومة وعرض حالة كل اتصال.",
  },
  {
    name: "المساعد الذكي",
    text: "تلخيص المهام واقتراح الأولويات ضمن صلاحيات المستخدم.",
  },
  {
    name: "التحليلات",
    text: "تقارير عن التأخير ومعدلات الإنجاز وحالات فشل سير العمل.",
  },
  {
    name: "الفريق والصلاحيات",
    text: "دعوة الموظفين وتحديد أدوارهم وإدارة وصولهم.",
  },
  {
    name: "السجل والأمان",
    text: "تسجيل العمليات المهمة والأحداث الأمنية في الشركة.",
  },
];

export default function Modules() {
  return (
    <section className="modules" aria-labelledby="modules-title">
      <div className="container">
        <h2 id="modules-title" className="modules__title">
          أقسام المنصة
        </h2>
        <p className="modules__lead">
          هذه الأقسام الثمانية هي أساس ORBIT. جميعها قيد التصميم حاليًا ولم تبدأ
          وظائفها بعد.
        </p>
        <ul className="modules__list">
          {modules.map((m) => (
            <li key={m.name} className="module">
              <div className="module__head">
                <h3>{m.name}</h3>
                <span className="status">قيد التصميم</span>
              </div>
              <p>{m.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
