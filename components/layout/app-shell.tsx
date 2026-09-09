"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarRange,
  CheckSquare,
  CircleDot,
  FolderOpen,
  Home,
  Library,
  LogOut,
  NotebookPen,
  RefreshCcw,
  Search,
  Settings,
  Target,
  Timer,
} from "lucide-react";

import { signOutAction } from "@/lib/actions/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const mainNavigation = [
  { href: "/dashboard", label: "首页", icon: Home },
  { href: "/goals", label: "目标", icon: Target },
  { href: "/courses", label: "课程", icon: BookOpen },
  { href: "/tasks", label: "任务", icon: CheckSquare },
  { href: "/focus", label: "专注", icon: Timer },
  { href: "/reviews", label: "复习", icon: RefreshCcw },
];

const resourceNavigation = [
  { href: "/plans/today", label: "计划", icon: CalendarRange },
  { href: "/materials", label: "资料", icon: FolderOpen },
  { href: "/knowledge", label: "知识库", icon: Library },
  { href: "/notes", label: "笔记", icon: NotebookPen },
  { href: "/analytics", label: "分析", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-9 items-center gap-3 px-3 text-sm transition-colors duration-150",
        active
          ? "bg-subtle font-medium text-ink"
          : "text-secondary hover:bg-subtle/70 hover:text-ink",
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex h-14 items-center gap-2.5 px-4">
      <CircleDot className="size-5 text-accent" strokeWidth={2.2} aria-hidden />
      <span className="text-[15px] font-semibold tracking-normal text-ink">StudyOS</span>
    </Link>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface md:flex">
        <Brand />
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-normal text-secondary/70">
            主空间
          </p>
          <div className="space-y-0.5">
            {mainNavigation.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
              />
            ))}
          </div>
          <p className="mt-6 px-3 pb-2 text-[11px] font-medium uppercase tracking-normal text-secondary/70">
            内容
          </p>
          <div className="space-y-0.5">
            {resourceNavigation.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
              />
            ))}
          </div>
        </nav>
        <div className="border-t border-line p-3">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-secondary">{user.email}</p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="icon" title="退出登录">
                <LogOut className="size-4" aria-hidden />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-canvas/85 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Brand />
          </div>
          <div className="hidden md:block">
            <Link
              href="/search"
              className="flex h-9 w-64 items-center gap-2 border border-line bg-surface px-3 text-sm text-secondary/70 transition-colors hover:border-line/80 hover:bg-subtle/60"
            >
              <Search className="size-4" aria-hidden />
              <span>搜索课程、任务与笔记</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex size-9 items-center justify-center text-secondary transition-colors hover:bg-subtle hover:text-ink md:hidden"
              title="搜索"
            >
              <Search className="size-4" aria-hidden />
            </Link>
            <span className="hidden text-sm text-secondary sm:block">
              {new Intl.DateTimeFormat("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
              }).format(new Date())}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-12">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch overflow-x-auto border-t border-line bg-surface/95 backdrop-blur-md md:hidden">
        {[...mainNavigation, ...resourceNavigation].map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-16 flex-1 flex-col items-center justify-center gap-1 px-2 text-[11px] transition-colors",
                active ? "text-accent" : "text-secondary",
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
