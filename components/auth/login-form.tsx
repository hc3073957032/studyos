"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="mt-8 space-y-5">
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
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
        登录
      </Button>

      <p className="text-center text-sm text-secondary">
        还没有账户？{" "}
        <Link href="/register" className="font-medium text-accent hover:text-accent/80">
          注册
        </Link>
      </p>
    </form>
  );
}
