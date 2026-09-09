import Link from "next/link";
import { redirect } from "next/navigation";
import { NotebookPen, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteNoteAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listNotes } from "@/lib/services/studyos";

export default async function NotesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const notes = await listNotes(userId);

  return (
    <>
      <PageHeader
        title="笔记"
        description="用自己的话重写刚学到的东西。"
        action={
          <div className="flex gap-2">
            <Link href="/notes/network">
              <Button variant="secondary">知识网络</Button>
            </Link>
            <Link href="/notes/new">
              <Button variant="primary">
                <Plus className="size-4" aria-hidden />
                新建笔记
              </Button>
            </Link>
          </div>
        }
      />

      {notes.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="还没有笔记"
          description="学完一个章节后，写一段自己的总结。"
          actionLabel="新建笔记"
          actionHref="/notes/new"
        />
      ) : (
        <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {notes.map((note) => (
            <div key={note.id} className="group flex items-start gap-4 px-4 py-4">
              <div className="min-w-0 flex-1">
                <Link href={`/notes/${note.id}`} className="text-sm font-semibold text-ink hover:text-accent">
                  {note.title}
                </Link>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-secondary">
                  {note.content || "没有正文"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {note.course ? <Badge variant="neutral">{note.course.name}</Badge> : null}
                  {note.knowledge ? <Badge variant="accent">{note.knowledge.title}</Badge> : null}
                  {note.tags.map((tag) => (
                    <Badge key={tag}>#{tag}</Badge>
                  ))}
                </div>
              </div>
              <form action={deleteNoteAction}>
                <input type="hidden" name="id" value={note.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  title="删除笔记"
                  className="opacity-60 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
