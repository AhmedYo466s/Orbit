import PasswordForm from "@/components/PasswordForm";

export const metadata = { title: "كلمة مرور جديدة | ORBIT" };

export default function ResetPasswordPage() {
  return <PasswordForm mode="reset" />;
}
