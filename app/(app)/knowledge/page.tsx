import Link from "next/link";
import { redirect } from "next/navigation";
import { Library, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
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
        description="把理解沉淀成可复习的知识点。"
        action={
          <Link href="/knowledge/new">
            <Button variant="primary">
              <Plus className="size-4" aria-hidden />
              新建知识点
            </Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Library}
          title="知识库还是空的"
          description="每学完一个概念，就把它整理成一个知识点。"
          actionLabel="创建知识点"
          actionHref="/knowledge/new"
        />
      ) : (
        <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 px-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                {item.summary ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-secondary">
                    {item.summary}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.course ? <Badge variant="neutral">{item.course.name}</Badge> : null}
                  {item.chapter ? <Badge>{item.chapter.title}</Badge> : null}
                  <Badge variant="accent">掌握度 {item.mastery}%</Badge>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-3">
                <Progress value={item.mastery} className="w-24" />
                <form action={deleteKnowledgeAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" variant="ghost" size="icon" title="删除知识点">
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
