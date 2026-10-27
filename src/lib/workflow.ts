export const workflowStatusLabels: Record<string, string> = {
  draft: "مسودة",
  active: "نشط",
  paused: "متوقف",
};

export const runStatusLabels: Record<string, string> = {
  running: "قيد التنفيذ",
  completed: "مكتمل",
  failed: "فشل",
};

export const eventLabels: Record<string, string> = {
  started: "بدأ التنفيذ",
  completed: "أنجز الخطوة",
  approved: "وافق على الخطوة",
  rejected: "رفض الخطوة",
};

export const workflowMessages: Record<string, string> = {
  invalid: "البيانات المدخلة غير صالحة.",
  forbidden: "ليست لديك صلاحية لهذا الإجراء.",
  failed: "تعذر تنفيذ العملية. حاول مرة أخرى.",
  locked: "تعديل الخطوات متاح في حالة المسودة فقط.",
  nosteps: "أضف خطوة واحدة على الأقل قبل التفعيل.",
  inactive: "سير العمل غير نشط.",
  finished: "هذا التنفيذ انتهى بالفعل.",
  limit: "تم الوصول إلى حد الباقة الحالية. تواصل مع إدارة ORBIT لترقية الباقة.",
};

export const workflowOk: Record<string, string> = {
  step: "تمت إضافة الخطوة.",
  removed: "حُذفت آخر خطوة.",
  status: "تم تحديث حالة سير العمل.",
  started: "بدأ التنفيذ.",
  decided: "تم تسجيل القرار.",
};
