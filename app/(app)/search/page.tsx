import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUserId, searchAll } from "@/lib/services/studyos";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const results = query.length > 0 ? await searchAll(userId, query) : null;

  const groups = results
    ? [
        ["课程", results.courses, "/courses/"],
        ["任务", results.tasks, "/tasks"],
        ["笔记", results.notes, "/notes"],
        ["知识点", results.knowledge, "/knowledge"],
        ["资料", results.materials, "/materials"],
      ].filter((group) => group[1].length > 0) as [string, { id: string; name?: string; title?: string }[], string][]
    : [];

  return (
    <>
      <PageHeader title="搜索" description="课程、任务、笔记、知识点与资料。" />
      <form action="/search" method="get" className="flex max-w-xl gap-2">
        <Input name="q" defaultValue={query} placeholder="搜索你的学习内容" autoFocus />
        <Button type="submit" variant="primary">
          <Search className="size-4" aria-hidden />
          搜索
        </Button>
      </form>

      <div className="mt-8 space-y-8">
        {query.length === 0 ? (
          <p className="text-sm text-secondary">输入关键词开始搜索。</p>
        ) : null}
        {query.length > 0 && groups.length === 0 ? (
          <p className="text-sm text-secondary">没有找到与“{query}”相关的内容。</p>
        ) : null}
        {groups.map(([label, items, base]) => (
          <section key={label}>
            <h2 className="mb-3 text-base font-semibold text-ink">{label}</h2>
            <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {items.map((item) => (
                <Link key={item.id} href={`${base}${base === "/tasks" || base === "/notes" || base === "/knowledge" || base === "/materials" ? "" : item.id}`} className="block px-4 py-3 hover:bg-subtle/60">
                  <p className="text-sm font-medium text-ink">{item.name ?? item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
