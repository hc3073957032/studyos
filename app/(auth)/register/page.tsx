import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "注册 | StudyOS",
};

export default function RegisterPage() {
  return (
    <section className="mt-10">
      <h1 className="text-2xl font-semibold tracking-normal text-ink">创建账户</h1>
      <p className="mt-1 text-sm text-secondary">建立属于你自己的学习空间。</p>
      <RegisterForm />
    </section>
  );
}
