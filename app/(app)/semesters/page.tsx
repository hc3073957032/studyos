import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { deleteSemesterAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listSemesters } from "@/lib/services/studyos";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function semesterProgress(start: Date, end: Date | null, now: number) {
  if (!end || end <= start) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round(((now - start.getTime()) / (end.getTime() - start.getTime())) * 100)),
  );
}

export default async function SemestersPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const semesters = await listSemesters(userId);
  const current = semesters.find((semester) => semester.isActive) ?? semesters[0];
  const now = new Date().getTime();
  const progress = current ? semesterProgress(current.startDate, current.endDate, now) : 0;
  const daysLeft = current?.endDate
    ? Math.max(0, Math.ceil((current.endDate.getTime() - now) / 86_400_000))
    : null;

  return (
    <>
      <PageHeader
        title="学期"
        description="用时间和进度感知学习节奏。"
        action={
          <Link href="/semesters/new">
            <Button variant="primary" className="rounded-full">
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
          description="创建一个学期，让课程、任务和目标拥有时间边界。"
          actionLabel="创建学期"
          actionHref="/semesters/new"
        />
      ) : (
        <>
          {current ? (
            <section className="grid gap-8 border-y border-line/70 py-8 lg:grid-cols-[200px_1fr] lg:items-center">
              <div className="flex justify-center">
                <ProgressRing value={progress} size={168} stroke={7} color="#0071e3" className="soft-pop">
                  <div className="text-center">
                    <p className="text-3xl font-semibold tabular-nums text-ink">{daysLeft ?? "—"}</p>
                    <p className="mt-1 text-xs text-secondary">{daysLeft === null ? "未设结束" : "天剩余"}</p>
                  </div>
                </ProgressRing>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">当前学期</Badge>
                  <span className="text-xs text-secondary">{progress}% 已完成</span>
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-ink">{current.name}</h2>
                <p className="mt-2 text-sm text-secondary">
                  {formatDate(current.startDate)}
                  {current.endDate ? ` - ${formatDate(current.endDate)}` : ""}
                </p>
                {current.description ? (
                  <p className="mt-4 max-w-xl text-sm leading-7 text-secondary">{current.description}</p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    ["课程", current._count.courses],
                    ["目标", current._count.goals],
                    ["任务", current._count.tasks],
                  ].map(([label, value]) => (
                    <span key={label} className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs text-secondary shadow-sm">
                      <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                      {label} {value}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="mb-6 text-base font-semibold text-ink">全部学期</h2>
            <ol className="relative ml-3 border-l border-line/80">
              {semesters.map((semester) => {
                const rowProgress = semesterProgress(semester.startDate, semester.endDate, now);
                return (
                  <li key={semester.id} className="relative pb-8 pl-8 last:pb-0">
                    <span className="absolute -left-3 top-6 flex size-6 items-center justify-center rounded-full border border-line bg-canvas">
                      <span className={semester.isActive ? "size-2 rounded-full bg-accent gentle-pulse" : "size-2 rounded-full bg-line"} aria-hidden />
                    </span>
                    <div className="group flex items-center gap-4">
                      <Link href={`/semesters/${semester.id}`} className="min-w-0 flex-1 rounded-md py-3 transition-colors hover:bg-subtle/40">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-ink">{semester.name}</p>
                          {semester.isActive ? <Badge variant="accent">进行中</Badge> : null}
                        </div>
                        <p className="mt-2 text-xs text-secondary">
                          {formatDate(semester.startDate)}
                          {semester.endDate ? ` - ${formatDate(semester.endDate)}` : ""}
                          {" · "}
                          {semester._count.courses} 门课程 · {semester._count.goals} 个目标
                        </p>
                      </Link>
                      <ProgressRing value={rowProgress} size={48} stroke={4}>
                        <span className="text-[10px] font-semibold tabular-nums text-ink">{rowProgress}%</span>
                      </ProgressRing>
                      <form action={deleteSemesterAction}>
                        <input type="hidden" name="id" value={semester.id} />
                        <Button type="submit" variant="ghost" size="icon" title="删除学期" className="opacity-0 transition-opacity group-hover:opacity-100">
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </>
  );
}