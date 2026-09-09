"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import { registerAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, {});
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={action} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          名称
        </label>
        <Input id="name" name="name" autoComplete="name" placeholder="你的称呼" required />
        {fieldErrors.name?.length ? (
          <p role="alert" className="text-sm text-danger">
            {fieldErrors.name[0]}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          邮箱
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        {fieldErrors.email?.length ? (
          <p role="alert" className="text-sm text-danger">
            {fieldErrors.email[0]}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {fieldErrors.password?.length ? (
          <p role="alert" className="text-sm text-danger">
            {fieldErrors.password[0]}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
          确认密码
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {fieldErrors.confirmPassword?.length ? (
          <p role="alert" className="text-sm text-danger">
            {fieldErrors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
        注册
      </Button>

      <p className="text-center text-sm text-secondary">
        已经有账户？{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent/80">
          登录
        </Link>
      </p>
    </form>
  );
}
