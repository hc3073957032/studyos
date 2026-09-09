import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Target, CheckSquare } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteSemesterAction } from "@/lib/actions/studyos";
import { getCurrentUserId, getSemester } from "@/lib/services/studyos";

export default async function SemesterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { id } = await params;
  const semester = await getSemester(userId, id);
  if (!semester) notFound();

  return (
    <>
      <Link
        href="/semesters"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回学期
      </Link>
      <PageHeader
        title={semester.name}
        description={semester.description ?? "这个学期还没有描述。"}
        action={
          <form action={deleteSemesterAction}>
            <input type="hidden" name="id" value={semester.id} />
            <Button type="submit" variant="ghost" className="text-danger hover:bg-danger/10">
              删除
            </Button>
          </form>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-ink">课程</h2>
          {semester.courses.length === 0 ? (
            <p className="border border-dashed border-line px-4 py-8 text-sm text-secondary">
              还没有课程。
            </p>
          ) : (
            <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {semester.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-subtle/60"
                >
                  <BookOpen className="size-4 text-secondary" aria-hidden />
                  <span className="text-sm font-medium text-ink">{course.name}</span>
                  <Badge className="ml-auto">{course._count.chapters} 章</Badge>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
              <Target className="size-4 text-secondary" aria-hidden />
              目标
            </h2>
            {semester.goals.length === 0 ? (
              <p className="border border-dashed border-line px-4 py-6 text-sm text-secondary">
                还没有关联目标。
              </p>
            ) : (
              <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
                {semester.goals.map((goal) => (
                  <Link
                    key={goal.id}
                    href={`/goals/${goal.id}`}
                    className="block px-4 py-3 text-sm text-ink hover:bg-subtle/60"
                  >
                    {goal.title}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
              <CheckSquare className="size-4 text-secondary" aria-hidden />
              任务
            </h2>
            {semester.tasks.length === 0 ? (
              <p className="border border-dashed border-line px-4 py-6 text-sm text-secondary">
                还没有任务。
              </p>
            ) : (
              <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
                {semester.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href="/tasks"
                    className="block px-4 py-3 text-sm text-ink hover:bg-subtle/60"
                  >
                    {task.title}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
