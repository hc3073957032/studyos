import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  addChapterAction,
  deleteCourseAction,
  updateChapterProgressAction,
} from "@/lib/actions/studyos";
import { getCurrentUserId, getCourse } from "@/lib/services/studyos";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { id } = await params;
  const course = await getCourse(userId, id);
  if (!course) notFound();

  return (
    <>
      <Link
        href="/courses"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回课程
      </Link>
      <PageHeader
        title={course.name}
        description={course.description ?? "这门课还没有描述。"}
        action={
          <form action={deleteCourseAction}>
            <input type="hidden" name="id" value={course.id} />
            <Button type="submit" variant="ghost" className="text-danger hover:bg-danger/10">
              <Trash2 className="size-4" aria-hidden />
              删除
            </Button>
          </form>
        }
      />

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">课程进度</span>
            <span className="font-medium text-ink">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="mt-2" />
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-secondary">
          <Link href={`/tasks/new`} className="inline-flex items-center gap-1.5 hover:text-accent">
            <CheckSquare className="size-4" aria-hidden />
            添加任务
          </Link>
          <Link href={`/materials/new`} className="inline-flex items-center gap-1.5 hover:text-accent">
            <FolderOpen className="size-4" aria-hidden />
            添加资料
          </Link>
          <Link href={`/notes/new`} className="inline-flex items-center gap-1.5 hover:text-accent">
            <FileText className="size-4" aria-hidden />
            添加笔记
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
          <BookOpen className="size-4 text-secondary" aria-hidden />
          课程章节
        </h2>
        {course.chapters.length === 0 ? (
          <p className="border border-dashed border-line px-4 py-8 text-sm text-secondary">
            还没有章节，先从第 1 章开始。
          </p>
        ) : (
          <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
            {course.chapters.map((chapter, index) => (
              <div key={chapter.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center bg-subtle text-xs font-medium text-secondary">
                    {chapter.order || index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{chapter.title}</p>
                    <p className="mt-0.5 text-xs text-secondary">
                      {chapter._count.tasks} 个任务 · {chapter._count.materials} 份资料 ·{" "}
                      {chapter._count.notes} 条笔记
                    </p>
                  </div>
                </div>
                <form
                  action={updateChapterProgressAction}
                  className="flex max-w-[220px] items-center gap-3"
                >
                  <input type="hidden" name="chapterId" value={chapter.id} />
                  <input
                    name="progress"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    defaultValue={chapter.progress}
                    className="w-28 accent-accent"
                  />
                  <span className="w-10 text-right text-xs tabular-nums text-secondary">
                    {chapter.progress}%
                  </span>
                  <Button type="submit" variant="ghost" size="sm">
                    保存
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addChapterAction} className="mt-4 flex flex-col gap-3 overflow-hidden rounded-md border border-line bg-surface p-4 sm:flex-row">
          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="order" value={course.chapters.length + 1} />
          <div className="flex-1">
            <Input name="title" placeholder="新章节，例如：集合框架" required />
          </div>
          <div className="flex-1">
            <Input name="description" placeholder="这一章学什么（可选）" />
          </div>
          <Button type="submit" variant="primary">
            <Plus className="size-4" aria-hidden />
            添加章节
          </Button>
        </form>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-base font-semibold text-ink">资料</h2>
          {course.materials.length === 0 ? (
            <p className="border border-dashed border-line px-4 py-6 text-sm text-secondary">
              还没有资料。
            </p>
          ) : (
            <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {course.materials.map((material) => (
                <div key={material.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-ink">{material.name}</p>
                  <Badge className="mt-1">{material.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-base font-semibold text-ink">笔记</h2>
          {course.notes.length === 0 ? (
            <p className="border border-dashed border-line px-4 py-6 text-sm text-secondary">
              还没有笔记。
            </p>
          ) : (
            <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {course.notes.map((note) => (
                <Link key={note.id} href="/notes" className="block px-4 py-3 hover:bg-subtle/60">
                  <p className="text-sm font-medium text-ink">{note.title}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
