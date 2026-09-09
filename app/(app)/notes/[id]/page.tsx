import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Network } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildKnowledgeNetwork,
  getCurrentUserId,
  getNote,
} from "@/lib/services/studyos";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { id } = await params;
  const note = await getNote(userId, id);
  if (!note) notFound();

  const graph = await buildKnowledgeNetwork(userId);
  const relatedIds = new Set<string>();
  graph.links.forEach((link) => {
    if (link.source === note.id) relatedIds.add(link.target);
    if (link.target === note.id) relatedIds.add(link.source);
  });
  const related = graph.nodes.filter((node) => relatedIds.has(node.id)).slice(0, 12);

  return (
    <>
      <Link
        href="/notes"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回笔记
      </Link>
      <PageHeader
        title={note.title}
        description={note.course?.name ?? "未关联课程"}
        action={
          <Link href="/notes/network">
            <Button variant="secondary">
              <Network className="size-4" aria-hidden />
              知识网络
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {note.course ? <Badge variant="neutral">{note.course.name}</Badge> : null}
        {note.knowledge ? <Badge variant="accent">{note.knowledge.title}</Badge> : null}
        {note.tags.map((tag) => (
          <Badge key={tag}>#{tag}</Badge>
        ))}
      </div>

      <article className="min-h-72 whitespace-pre-wrap border border-line bg-surface p-6 text-[15px] leading-8 text-ink">
        {note.content || "这篇笔记还没有正文。"}
      </article>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-ink">相关笔记</h2>
        {related.length === 0 ? (
          <p className="border border-dashed border-line px-4 py-6 text-sm text-secondary">
            还没有发现连接。试试为笔记加上相同的标签。
          </p>
        ) : (
          <div className="divide-y divide-line border border-line bg-surface">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/notes/${item.id}`}
                className="block px-4 py-3 transition-colors hover:bg-subtle/60"
              >
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs text-secondary">
                  {item.course ?? "未关联课程"}
                  {item.knowledge ? ` · ${item.knowledge}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
