import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "登录 | StudyOS",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="mt-10">
      <h1 className="text-2xl font-semibold tracking-normal text-ink">欢迎回来</h1>
      <p className="mt-1 text-sm text-secondary">登录后继续你的学习。</p>
      {params.registered ? (
        <p className="mt-6 border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
          注册成功，请登录。
        </p>
      ) : null}
      <LoginForm />
    </section>
  );
}