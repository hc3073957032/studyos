import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6">
      <h1 className="text-2xl font-semibold text-ink">页面不存在</h1>
      <p className="text-sm text-secondary">这个页面可能还没有创建或已经被移动。</p>
      <Link href="/dashboard">
        <Button>回到首页</Button>
      </Link>
    </main>
  );
}
