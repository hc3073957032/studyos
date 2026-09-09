import { redirect } from "next/navigation";
import { BarChart3, CircleCheck, Clock3, ListChecks, Sparkles, Trophy } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { formatMinutes, formatPercent } from "@/lib/utils";
import { getAnalyticsData, getCurrentUserId, getDashboardData } from "@/lib/services/studyos";

export default async function AnalyticsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const [data, dashboard] = await Promise.all([getAnalyticsData(userId), getDashboardData(userId)]);

  const dayTotals = new Map<string, number>();
  for (const item of data.dailyMinutes) {
    const key = item.date.slice(0, 10);
    dayTotals.set(key, (dayTotals.get(key) ?? 0) + item.minutes);
  }
  const lastDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (13 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { key, minutes: dayTotals.get(key) ?? 0 };
  });
  const maxMinutes = Math.max(10, ...lastDays.map((day) => day.minutes));

  return (
    <>
      <PageHeader title="数据分析" description="看趋势，而不是只做记录。" />

      {data.totalMinutes === 0 && data.totalSessions === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="还没有可分析的数据"
          description="开始一段专注后，这里会出现每日时长和课程分布。"
          actionLabel="去专注"
          actionHref="/focus"
        />
      ) : (
        <>
          <dl className="grid grid-cols-2 overflow-hidden rounded-md border border-line bg-surface lg:grid-cols-4">
            <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
              <dt className="flex items-center gap-2 text-xs text-secondary">
                <Clock3 className="size-4" aria-hidden />
                本月学习
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-ink">{formatMinutes(data.totalMinutes)}</dd>
            </div>
            <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
              <dt className="flex items-center gap-2 text-xs text-secondary">
                <Sparkles className="size-4" aria-hidden />
                专注次数
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-ink">{data.totalSessions}</dd>
            </div>
            <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
              <dt className="flex items-center gap-2 text-xs text-secondary">
                <ListChecks className="size-4" aria-hidden />
                本月完成
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-ink">
                {data.completedTasks}
                <span className="ml-1 text-sm font-normal text-secondary">/ {data.allTasks}</span>
              </dd>
            </div>
            <div className="p-5">
              <dt className="text-xs text-secondary">课程数</dt>
              <dd className="mt-2 text-2xl font-semibold text-ink">{data.courses.length}</dd>
            </div>
          </dl>

          <section className="mt-8">
            <h2 className="mb-4 text-base font-semibold text-ink">最近 14 天学习时长</h2>
            <div className="overflow-hidden rounded-md border border-line bg-surface p-5">
              <div className="flex h-40 items-end gap-1.5">
                {lastDays.map((day) => (
                  <div key={day.key} className="flex h-full flex-1 flex-col justify-end">
                    <div
                      className="min-h-1 w-full bg-accent/80 transition-[height]"
                      style={{ height: `${Math.max(3, (day.minutes / maxMinutes) * 100)}%` }}
                      title={`${day.key}: ${day.minutes} 分钟`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-secondary/70">
                <span>{lastDays[0]?.key.slice(5) ?? ""}</span>
                <span>{lastDays.at(-1)?.key.slice(5) ?? ""}</span>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-base font-semibold text-ink">课程进度</h2>
            <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {data.courses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{course.name}</p>
                    <p className="mt-0.5 text-xs text-secondary">
                      {course._count.studySessions} 次专注 · {course._count.knowledge} 个知识点
                    </p>
                  </div>
                  <span className="w-10 text-right text-xs text-secondary">
                    {formatPercent(course.progress)}
                  </span>
                  <Progress value={course.progress} className="w-24 sm:w-40" />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
              <Trophy className="size-4 text-secondary" aria-hidden />
              成就
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "连续学习 7 天", earned: dashboard.streak >= 7 },
                { title: "连续学习 30 天", earned: dashboard.streak >= 30 },
                { title: "累计学习 10 小时", earned: data.totalMinutes >= 600 },
                { title: "第一门课程", earned: data.courses.length >= 1 },
                { title: "完成第一个任务", earned: data.completedTasks >= 1 },
              ].map((achievement) => (
                <div key={achievement.title} className="flex items-center gap-3 overflow-hidden rounded-md border border-line bg-surface px-4 py-3">
                  {achievement.earned ? (
                    <CircleCheck className="size-5 text-success" aria-hidden />
                  ) : (
                    <CircleCheck className="size-5 text-line" aria-hidden />
                  )}
                  <span className={achievement.earned ? "text-sm font-medium text-ink" : "text-sm text-secondary"}>
                    {achievement.title}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
