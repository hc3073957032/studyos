import Link from "next/link";
import { redirect } from "next/navigation";
import { Library, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { deleteKnowledgeAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listKnowledge } from "@/lib/services/studyos";

export default async function KnowledgePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const items = await listKnowledge(userId);

  return (
    <>
      <PageHeader
        title="知识库"
        description="每一页知识都放在自己的书架上。"
        action={
          <Link href="/knowledge/new">
            <Button variant="primary">
              <Plus className="size-4" aria-hidden />
              写新知识
            </Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Library}
          title="书架上还没有书"
          description="每学完一个概念，就把它写成一本可以回看的“小书”。"
          actionLabel="写第一页知识"
          actionHref="/knowledge/new"
        />
      ) : (
        <div>
          <p className="mb-5 text-sm text-secondary">{items.length} 本知识册</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {items.map((item, index) => {
              const color = item.course?.color ?? "#0071e3";
              const notesCount = item._count.notes;
              const reviewCount = item._count.reviews;
              return (
                <div
                  key={item.id}
                  className="knowledge-book group flex flex-col"
                  style={{ animationDelay: `${Math.min(index, 20) * 45}ms` }}
                >
                  <div className="relative aspect-[3/4]">
                    <Link
                      href={`/knowledge/${item.id}`}
                      className="absolute inset-0 flex flex-col overflow-hidden rounded-md border border-line bg-surface p-3 transition-colors duration-300 group-hover:border-line/80"
                    >
                      <div className="h-1 w-full rounded-full" style={{ backgroundColor: color }} />
                      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-ink">
                        {item.title}
                      </p>
                      {item.summary ? (
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-secondary">
                          {item.summary}
                        </p>
                      ) : null}
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-secondary">
                          <span>掌握度</span>
                          <span className="font-medium tabular-nums text-ink">{item.mastery}%</span>
                        </div>
                        <Progress value={item.mastery} />
                      </div>
                    </Link>
                    <div className="absolute right-1.5 top-1.5 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <form action={deleteKnowledgeAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button type="submit" variant="secondary" size="icon" title="移出书架">
                          <Trash2 className="size-3.5" aria-hidden />
                        </Button>
                      </form>
                    </div>
                  </div>
                  <div className="px-1 pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-secondary">
                        {item.course?.name ?? item.chapter?.title ?? "个人知识"}
                      </p>
                      <span className="flex shrink-0 gap-2 text-[11px] text-secondary/70">
                        {notesCount > 0 ? <span>{notesCount} 笔记</span> : null}
                        {reviewCount > 0 ? <span>{reviewCount} 复习</span> : null}
                      </span>
                    </div>
                    <div className="mt-1 h-px bg-line" aria-hidden />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}