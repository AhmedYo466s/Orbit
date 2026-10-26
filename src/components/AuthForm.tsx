"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
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
    const name = String(form.get("name") || "").trim();

    if (mode === "signup" && (name.length < 2 || password.length < 8)) {
      setMessage("اكتب اسمك، وكلمة مرور من 8 أحرف على الأقل.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "login") {
        const res = await supabase.auth.signInWithPassword({ email, password });
        if (res.error) {
          setMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
          return;
        }
        const next = new URLSearchParams(window.location.search).get("next");
        router.push(next && next.startsWith("/app") ? next : "/app");
        router.refresh();
      } else {
        const res = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (res.error) {
          setMessage("تعذر إنشاء الحساب. تأكد من البيانات وحاول مرة أخرى.");
          return;
        }
        if (res.data.session) {
          router.push("/app");
          router.refresh();
        } else {
          setNotice("أرسلنا رابط تأكيد إلى بريدك الإلكتروني. افتحه ثم سجل الدخول.");
        }
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
        <h1>{mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}</h1>
        {!configured && (
          <p className="alert alert--warning" role="alert">
            الاتصال بقاعدة البيانات لم يُعد بعد.
          </p>
        )}
        <form onSubmit={onSubmit} className="form" noValidate>
          {mode === "signup" && (
            <label className="field">
              <span>الاسم</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
          )}
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
          <label className="field">
            <span>كلمة المرور</span>
            <input
              name="password"
              type="password"
              dir="ltr"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>
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
            {busy ? "جار التنفيذ" : mode === "login" ? "دخول" : "إنشاء الحساب"}
          </button>
        </form>
        {mode === "login" && (
          <p>
            <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
          </p>
        )}
        <p>
          {mode === "login" ? (
            <>
              ليس لديك حساب؟ <Link href="/signup">إنشاء حساب</Link>
            </>
          ) : (
            <>
              لديك حساب؟ <Link href="/login">تسجيل الدخول</Link>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
