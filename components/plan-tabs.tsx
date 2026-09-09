import Link from "next/link";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/plans/today", label: "今天" },
  { href: "/plans/week", label: "本周" },
  { href: "/plans/month", label: "本月" },
];

export function PlanTabs({ active }: { active: string }) {
  return (
    <nav className="mb-5 inline-flex border border-line bg-surface p-0.5">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-4 py-2 text-sm transition-colors",
            active === tab.href ? "bg-subtle font-medium text-ink" : "text-secondary hover:text-ink",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
