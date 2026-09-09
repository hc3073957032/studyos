import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FilePlus2, Library, RefreshCcw } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCurrentUserId, getKnowledge } from "@/lib/services/studyos";

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { id } = await params;
  const item = await getKnowledge(userId, id);
  if (!item) notFound();

  return (
    <>
      <Link
        href="/knowledge"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回书架
      </Link>
      <PageHeader
        title={item.title}
        description={item.course?.name ?? "个人知识"}
        action={
          <div className="flex gap-2">
            <Link href="/reviews/new">
              <Button variant="secondary">
                <RefreshCcw className="size-4" aria-hidden />
                建复习卡
              </Button>
            </Link>
            <Link href="/notes/new">
              <Button variant="primary">
                <FilePlus2 className="size-4" aria-hidden />
                写笔记
              </Button>
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {item.course ? <Badge variant="neutral">{item.course.name}</Badge> : null}
        {item.chapter ? <Badge>{item.chapter.title}</Badge> : null}
        <Badge variant="accent">掌握度 {item.mastery}%</Badge>
      </div>

      <div className="mb-8 max-w-sm">
        <div className="mb-1 flex justify-between text-xs text-secondary">
          <span>掌握程度</span>
          <span>{item.mastery}%</span>
        </div>
        <Progress value={item.mastery} />
      </div>

      {item.summary ? (
        <p className="mb-6 max-w-2xl border-l-2 border-accent pl-4 text-[15px] leading-7 text-secondary">
          {item.summary}
        </p>
      ) : null}

      <article className="min-h-56 whitespace-pre-wrap border border-line bg-surface p-6 text-[15px] leading-8 text-ink">
        {item.content || "这页知识还没有详细内容。"}
      </article>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-base font-semibold text-ink">相关笔记</h2>
          {item.notes.length === 0 ? (
            <p className="border border-dashed border-line px-4 py-6 text-sm text-secondary">
              还没有笔记关联到这条知识。
            </p>
          ) : (
            <div className="divide-y divide-line border border-line bg-surface">
              {item.notes.map((note) => (
                <Link key={note.id} href={`/notes/${note.id}`} className="block px-4 py-3 hover:bg-subtle/60">
                  <p className="text-sm font-medium text-ink">{note.title}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
            <Library className="size-4 text-secondary" aria-hidden />
            最近复习
          </h2>
          {item.reviews.length === 0 ? (
            <p className="border border-dashed border-line px-4 py-6 text-sm text-secondary">
              还没有复习记录。
            </p>
          ) : (
            <div className="divide-y divide-line border border-line bg-surface">
              {item.reviews.map((review) => (
                <div key={review.id} className="px-4 py-3">
                  <p className="text-sm text-ink">{review.question}</p>
                  <p className="mt-0.5 text-xs text-secondary">
                    下次复习：{new Intl.DateTimeFormat("zh-CN").format(review.dueAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
