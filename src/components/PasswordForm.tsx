"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PasswordForm({ mode }: { mode: "forgot" | "reset" }) {
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setNotice("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (mode === "reset") {
      if (password.length < 8) {
        setMessage("كلمة المرور يجب ألا تقل عن 8 أحرف.");
        return;
      }
      if (password !== confirm) {
        setMessage("كلمتا المرور غير متطابقتين.");
        return;
      }
    }

    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "forgot") {
        const res = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (res.error) {
          setMessage("تعذر إرسال الرابط. حاول مرة أخرى لاحقًا.");
          return;
        }
        setNotice("إذا كان البريد مسجلًا، سيصل رابط إعادة التعيين خلال دقائق.");
      } else {
        const res = await supabase.auth.updateUser({ password });
        if (res.error) {
          setMessage("تعذر تغيير كلمة المرور. اطلب رابطًا جديدًا وحاول مرة أخرى.");
          return;
        }
        setDone(true);
        setNotice("تم تغيير كلمة المرور.");
      }
    } catch {
      setMessage("حدث خطأ في الاتصال. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="static-page">
      <div className="container auth">
        <h1>
          {mode === "forgot" ? "استعادة كلمة المرور" : "كلمة مرور جديدة"}
        </h1>
        {!configured && (
          <p className="alert alert--warning" role="alert">
            الاتصال بقاعدة البيانات لم يُعد بعد.
          </p>
        )}
        {!done && (
          <form onSubmit={onSubmit} className="form" noValidate>
            {mode === "forgot" ? (
              <label className="field">
                <span>البريد الإلكتروني</span>
                <input
                  name="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  required
                />
              </label>
            ) : (
              <>
                <label className="field">
                  <span>كلمة المرور الجديدة</span>
                  <input
                    name="password"
                    type="password"
                    dir="ltr"
                    autoComplete="new-password"
                    required
                  />
                </label>
                <label className="field">
                  <span>تأكيد كلمة المرور</span>
                  <input
                    name="confirm"
                    type="password"
                    dir="ltr"
                    autoComplete="new-password"
                    required
                  />
                </label>
              </>
            )}
            {message && (
              <p className="alert alert--danger" role="alert">
                {message}
              </p>
            )}
            {notice && (
              <p className="alert" role="status">
                {notice}
              </p>
            )}
            <button
              className="btn btn--primary"
              type="submit"
              disabled={busy || !configured}
            >
              {busy
                ? "جار التنفيذ"
                : mode === "forgot"
                ? "إرسال الرابط"
                : "حفظ كلمة المرور"}
            </button>
          </form>
        )}
        {done && (
          <>
            <p className="alert" role="status">
              {notice}
            </p>
            <p>
              <Link href="/app">الدخول إلى المنصة</Link>
            </p>
          </>
        )}
        <p>
          <Link href="/login">العودة إلى تسجيل الدخول</Link>
        </p>
      </div>
    </section>
  );
}
