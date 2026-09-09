import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Circle, Play, Target, BookOpen } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { setTaskStatusAction } from "@/lib/actions/studyos";
import { formatMinutes } from "@/lib/utils";
import { getCurrentUserId, getDashboardData } from "@/lib/services/studyos";

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function formatTaskTime(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const data = await getDashboardData(userId);
  const now = new Date();
  const remainingTasks = data.todayTasks.filter((task) => task.status !== "COMPLETED");

  return (
    <>
      <PageHeader
        title={`${greeting(now)}，今天要学点什么`}
        description={new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        }).format(now)}
      />

      <dl className="grid grid-cols-1 overflow-hidden rounded-md border border-line bg-surface sm:grid-cols-3">
        <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
          <dt className="text-xs text-secondary">今日任务</dt>
          <dd className="mt-2 text-2xl font-semibold text-ink">
            {remainingTasks.length}
            <span className="ml-1 text-sm font-normal text-secondary">个待完成</span>
          </dd>
        </div>
        <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
          <dt className="text-xs text-secondary">预计专注</dt>
          <dd className="mt-2 text-2xl font-semibold text-ink">
            {formatMinutes(data.plannedMinutes)}
          </dd>
        </div>
        <div className="p-5">
          <dt className="text-xs text-secondary">连续学习</dt>
          <dd className="mt-2 text-2xl font-semibold text-ink">
            {data.streak}
            <span className="ml-1 text-sm font-normal text-secondary">天</span>
          </dd>
        </div>
      </dl>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">今天</h2>
          <Link href="/tasks" className="text-sm text-accent hover:text-accent/80">
            查看全部
          </Link>
        </div>

        {remainingTasks.length === 0 ? (
          <EmptyState
            icon={Check}
            title="今天的任务已经清空"
            description="可以去计划页安排下一项学习，或者开始一段专注。"
            actionLabel="安排任务"
          />
        ) : (
          <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
            {remainingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                <form action={setTaskStatusAction}>
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="status" value="COMPLETED" />
                  <button
                    type="submit"
                    title="完成任务"
                    className="flex size-5 shrink-0 items-center justify-center rounded-full border border-line text-secondary transition-colors hover:border-accent hover:text-accent"
                  >
                    <Circle className="size-3" aria-hidden />
                  </button>
                </form>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{task.title}</p>
                  <p className="mt-0.5 truncate text-xs text-secondary">
                    {task.course?.name ?? task.goal?.title ?? "未关联课程"}
                    {task.estimatedMinutes ? ` · ${formatMinutes(task.estimatedMinutes)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {formatTaskTime(task.scheduledAt) ? (
                    <span className="text-xs tabular-nums text-secondary">{formatTaskTime(task.scheduledAt)}</span>
                  ) : null}
                  <Link
                    href={`/focus?taskId=${task.id}`}
                    className="flex size-8 items-center justify-center text-secondary transition-colors hover:bg-subtle hover:text-accent"
                    title="开始专注"
                  >
                    <Play className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {data.activeSession ? (
        <section className="mt-6 border border-success/20 bg-success/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-success" aria-hidden />
              <div>
                <p className="text-sm font-medium text-ink">专注正在进行</p>
                <p className="text-xs text-secondary">
                  {data.activeSession.course?.name ?? "自由学习"}
                </p>
              </div>
            </div>
            <Link href="/focus" className="text-sm font-medium text-success hover:text-success/80">
              继续
            </Link>
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <BookOpen className="size-4 text-secondary" aria-hidden />
              最近学习
            </h2>
            <Link href="/courses" className="text-sm text-accent hover:text-accent/80">
              课程
            </Link>
          </div>
          {data.courses.length === 0 ? (
            <EmptyState icon={BookOpen} title="还没有课程" description="创建课程后会在这里显示学习进度。" />
          ) : (
            <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {data.courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="block px-4 py-3 hover:bg-subtle/60">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-medium text-ink">{course.name}</p>
                    <span className="text-xs tabular-nums text-secondary">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="mt-2" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <Target className="size-4 text-secondary" aria-hidden />
              进行中的目标
            </h2>
            <Link href="/goals" className="text-sm text-accent hover:text-accent/80">
              目标
            </Link>
          </div>
          {data.goals.length === 0 ? (
            <EmptyState icon={Target} title="还没有目标" description="先写下一个长期目标，学习路径会更清楚。" />
          ) : (
            <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {data.goals.map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}`} className="block px-4 py-3 hover:bg-subtle/60">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-medium text-ink">{goal.title}</p>
                    <Badge variant={goal.type === "LONG_TERM" ? "accent" : "neutral"}>
                      {goal.type === "LONG_TERM" ? "长期" : goal.type === "SEMESTER" ? "学期" : "技能"}
                    </Badge>
                  </div>
                  <Progress value={goal.progress} className="mt-2" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6">
        <Link href="/tasks" className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80">
          <ArrowRight className="size-4" aria-hidden />
          打开今日计划
        </Link>
      </div>
    </>
  );
}