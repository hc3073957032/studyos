import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteSemesterAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listSemesters } from "@/lib/services/studyos";

function formatPeriod(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
  }).format(date);
}

export default async function SemestersPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const semesters = await listSemesters(userId);

  return (
    <>
      <PageHeader
        title="学期"
        description="用学期为课程、任务与目标划定时间边界。"
        action={
          <Link href="/semesters/new">
            <Button variant="primary">
              <Plus className="size-4" aria-hidden />
              新建学期
            </Button>
          </Link>
        }
      />

      {semesters.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="还没有学期"
          description="创建一个学期，例如“2026-2027 第一学期”。"
          actionLabel="创建学期"
          actionHref="/semesters/new"
        />
      ) : (
        <div className="divide-y divide-line border border-line bg-surface">
          {semesters.map((semester) => (
            <div key={semester.id} className="group flex items-center gap-4 px-4 py-3">
              <Link href={`/semesters/${semester.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ink">{semester.name}</p>
                  {semester.isActive ? <Badge variant="success">当前</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-secondary">
                  {formatPeriod(semester.startDate)}
                  {semester.endDate ? ` - ${formatPeriod(semester.endDate)}` : ""}
                  {" · "}
                  {semester._count.courses} 门课程 · {semester._count.goals} 个目标 ·{" "}
                  {semester._count.tasks} 个任务
                </p>
              </Link>
              <form action={deleteSemesterAction}>
                <input type="hidden" name="id" value={semester.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  title="删除学期"
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
