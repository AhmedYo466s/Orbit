import PasswordForm from "@/components/PasswordForm";

export const metadata = { title: "استعادة كلمة المرور | ORBIT" };

export default function ForgotPasswordPage() {
  return <PasswordForm mode="forgot" />;
}
