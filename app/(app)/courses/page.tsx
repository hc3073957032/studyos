import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { deleteCourseAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listCourses } from "@/lib/services/studyos";

export default async function CoursesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const courses = await listCourses(userId);

  return (
    <>
      <PageHeader
        title="课程"
        description="每门课程都是一个独立的学习空间。"
        action={
          <Link href="/courses/new">
            <Button variant="primary">
              <Plus className="size-4" aria-hidden />
              新建课程
            </Button>
          </Link>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="还没有课程"
          description="创建第一门课程，例如 Java 程序设计或数据结构。"
          actionLabel="创建课程"
          actionHref="/courses/new"
        />
      ) : (
        <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {courses.map((course) => (
            <div key={course.id} className="group flex items-start gap-4 px-4 py-4">
              <Link href={`/courses/${course.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: course.color }}
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-ink">{course.name}</p>
                  {course.semester ? (
                    <Badge variant="neutral">{course.semester.name}</Badge>
                  ) : null}
                  <span className="text-xs tabular-nums text-secondary">{course.progress}%</span>
                </div>
                <p className="mt-1 text-xs text-secondary">
                  {course.chapters.length} 章 · {course._count.tasks} 个任务 ·{" "}
                  {course._count.notes} 条笔记 · {course._count.materials} 份资料
                </p>
                <Progress value={course.progress} className="mt-2 max-w-sm" />
              </Link>
              <form action={deleteCourseAction}>
                <input type="hidden" name="id" value={course.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  title="删除课程"
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
