import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Circle, Play } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
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
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const data = await getDashboardData(userId);
  const now = new Date();
  const activeTasks = data.todayTasks.filter(
    (task) => task.status !== "COMPLETED",
  );
  const completedToday = data.todayTasks.filter(
    (task) => task.status === "COMPLETED",
  );
  const totalToday = data.todayTasks.length;
  const progress = totalToday > 0 ? Math.round((completedToday.length / totalToday) * 100) : 0;
  const plannedMinutes = activeTasks.reduce(
    (sum, task) => sum + (task.estimatedMinutes ?? 0),
    0,
  );
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <>
      <header className="mb-10">
        <p className="text-sm text-secondary">
          {new Intl.DateTimeFormat("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          }).format(now)}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-ink">
          {greeting(now)}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-secondary">
          今天还剩 {activeTasks.length} 个任务，预计需要 {formatMinutes(plannedMinutes)}。
        </p>
      </header>

      {data.activeSession ? (
        <Link
          href="/focus"
          className="mb-8 flex items-center justify-between border-y border-line/70 py-4 transition-colors hover:bg-subtle/40"
        >
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            <div>
              <p className="text-sm font-medium text-ink">专注正在进行</p>
              <p className="mt-0.5 text-xs text-secondary">
                {data.activeSession.course?.name ?? "自由学习"}
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-secondary" aria-hidden />
        </Link>
      ) : null}

      <div className="grid gap-12 lg:grid-cols-[1fr_260px]">
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">今天</h2>
              <p className="mt-1 text-xs text-secondary">
                {formatMinutes(plannedMinutes)} 预计专注
              </p>
            </div>
            <Link href="/tasks" className="text-sm text-secondary transition-colors hover:text-ink">
              管理任务
            </Link>
          </div>

          {activeTasks.length === 0 && completedToday.length === 0 ? (
            <EmptyState
              icon={Check}
              title="今天还没有安排"
              description="给自己安排一件 20-30 分钟就能完成的事。"
              actionLabel="添加任务"
              actionHref="/tasks/new"
            />
          ) : (
            <div className="divide-y divide-line/70">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-subtle/35"
                >
                  <form action={setTaskStatusAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="status" value="COMPLETED" />
                    <button
                      type="submit"
                      title="完成任务"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-secondary transition-all duration-200 hover:border-accent hover:text-accent"
                    >
                      <Circle className="size-3.5" aria-hidden />
                    </button>
                  </form>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-ink">{task.title}</p>
                    <p className="mt-1 truncate text-xs text-secondary">
                      {task.course?.name ?? task.goal?.title ?? "未分类"}
                      {task.estimatedMinutes ? ` · ${formatMinutes(task.estimatedMinutes)}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {formatTaskTime(task.scheduledAt) ? (
                      <span className="text-xs tabular-nums text-secondary/80">
                        {formatTaskTime(task.scheduledAt)}
                      </span>
                    ) : null}
                    <Link
                      href={`/focus?taskId=${task.id}`}
                      className="flex size-8 items-center justify-center rounded-full text-secondary opacity-0 transition-all duration-200 hover:bg-subtle hover:text-accent group-hover:opacity-100"
                      title="开始专注"
                    >
                      <Play className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              ))}
              {completedToday.length > 0 ? (
                <div className="pt-4 text-xs text-secondary">
                  今天已完成 {completedToday.length} 项
                </div>
              ) : null}
            </div>
          )}
        </section>

        <aside className="flex flex-col items-center lg:items-start">
          <div className="relative size-52">
            <svg viewBox="0 0 160 160" className="size-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-line"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                className="text-accent transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold tabular-nums text-ink">{progress}%</span>
              <span className="mt-1 text-xs text-secondary">今日进度</span>
            </div>
          </div>

          <dl className="mt-6 grid w-full grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <dt className="text-xs text-secondary">本周专注</dt>
              <dd className="mt-1 text-lg font-semibold text-ink">{formatMinutes(data.weekMinutes)}</dd>
            </div>
            <div>
              <dt className="text-xs text-secondary">连续学习</dt>
              <dd className="mt-1 text-lg font-semibold text-ink">{data.streak} 天</dd>
            </div>
            <div>
              <dt className="text-xs text-secondary">本月专注</dt>
              <dd className="mt-1 text-lg font-semibold text-ink">{formatMinutes(data.monthMinutes)}</dd>
            </div>
            <div>
              <dt className="text-xs text-secondary">待办总数</dt>
              <dd className="mt-1 text-lg font-semibold text-ink">{data.activeTaskCount}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-14 grid gap-10 border-t border-line/70 pt-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">继续学习</h2>
            <Link href="/courses" className="text-xs text-secondary hover:text-ink">
              全部课程
            </Link>
          </div>
          {data.courses.length === 0 ? (
            <p className="py-5 text-sm text-secondary">还没有课程。</p>
          ) : (
            <div className="space-y-5">
              {data.courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="block group">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-medium text-ink transition-colors group-hover:text-accent">
                      {course.name}
                    </p>
                    <span className="text-xs tabular-nums text-secondary">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="mt-2" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">目标</h2>
            <Link href="/goals" className="text-xs text-secondary hover:text-ink">
              全部目标
            </Link>
          </div>
          {data.goals.length === 0 ? (
            <p className="py-5 text-sm text-secondary">还没有目标。</p>
          ) : (
            <div className="divide-y divide-line/70">
              {data.goals.map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-subtle/35"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{goal.title}</p>
                    <p className="mt-0.5 text-xs text-secondary">
                      {goal.type === "LONG_TERM" ? "长期目标" : goal.type === "SEMESTER" ? "学期目标" : "技能目标"}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-secondary">{goal.progress}%</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}