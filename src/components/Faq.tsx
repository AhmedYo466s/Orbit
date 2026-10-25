const items = [
  {
    q: "هل ORBIT متاحة للاستخدام الآن؟",
    a: "لا. المنصة قيد التطوير، وهذا الموقع يعرض الفكرة والتصميم فقط.",
  },
  {
    q: "هل تتصل ORBIT ببرامج أخرى؟",
    a: "لا توجد تكاملات منفذة حاليًا. سنعرض كل تكامل بحالته الفعلية عند إضافته.",
  },
  {
    q: "هل ستكون بيانات شركتي معزولة عن الشركات الأخرى؟",
    a: "هذا من أهم أهداف التصميم، وسيُختبر قبل أي إطلاق. لا نعتبره متحققًا الآن.",
  },
  {
    q: "كم سعر الاشتراك؟",
    a: "لم تُحدد الأسعار بعد، ولا يوجد تحصيل مالي حاليًا.",
  },
  {
    q: "هل ستدعم المنصة العربية والإنجليزية؟",
    a: "نعم، هذا مخطط له مع دعم حقيقي للكتابة من اليمين إلى اليسار.",
  },
];

export default function Faq() {
  return (
    <section className="modules" aria-labelledby="faq-title">
      <div className="container">
        <h2 id="faq-title" className="modules__title">
          الأسئلة الشائعة
        </h2>
        <div className="faq__list">
          {items.map((i) => (
            <details key={i.q} className="faq__item">
              <summary>{i.q}</summary>
              <p>{i.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
