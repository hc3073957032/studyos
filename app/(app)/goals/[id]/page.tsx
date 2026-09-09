import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, Circle, Plus, Target, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  createMilestoneAction,
  deleteGoalAction,
  toggleMilestoneAction,
} from "@/lib/actions/studyos";
import { getCurrentUserId, getGoal } from "@/lib/services/studyos";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const { id } = await params;
  const goal = await getGoal(userId, id);
  if (!goal) notFound();

  return (
    <>
      <Link
        href="/goals"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回目标
      </Link>
      <PageHeader
        title={goal.title}
        description={goal.description ?? goal.targetMetric ?? "这个目标还没有描述。"}
        action={
          <form action={deleteGoalAction}>
            <input type="hidden" name="id" value={goal.id} />
            <Button type="submit" variant="ghost" className="text-danger hover:bg-danger/10">
              <Trash2 className="size-4" aria-hidden />
              删除
            </Button>
          </form>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="overflow-hidden rounded-md border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-secondary">完成进度</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{goal.progress}%</p>
              </div>
              <Badge variant="accent">{goal.type === "LONG_TERM" ? "长期" : goal.type === "SEMESTER" ? "学期" : "技能"}</Badge>
            </div>
            <Progress value={goal.progress} className="mt-4" />
            {goal.dueDate ? (
              <p className="mt-3 text-xs text-secondary">
                截止：{new Intl.DateTimeFormat("zh-CN").format(goal.dueDate)}
              </p>
            ) : null}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                <Target className="size-4 text-secondary" aria-hidden />
                阶段
              </h2>
            </div>
            {goal.milestones.length === 0 ? (
              <p className="border border-dashed border-line px-4 py-6 text-sm text-secondary">
                还没有阶段，拆解后更容易坚持。
              </p>
            ) : (
              <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
                {goal.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-3 px-4 py-3">
                    <form action={toggleMilestoneAction}>
                      <input type="hidden" name="id" value={milestone.id} />
                      <input
                        type="hidden"
                        name="completed"
                        value={milestone.completed ? "off" : "on"}
                      />
                      <button
                        type="submit"
                        title={milestone.completed ? "标记未完成" : "标记完成"}
                        className="flex size-5 items-center justify-center rounded-full border border-line text-secondary transition-colors hover:border-accent hover:text-accent"
                      >
                        {milestone.completed ? (
                          <Check className="size-3 text-success" aria-hidden />
                        ) : (
                          <Circle className="size-3" aria-hidden />
                        )}
                      </button>
                    </form>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{milestone.title}</p>
                      {milestone.description ? (
                        <p className="mt-0.5 text-xs text-secondary">{milestone.description}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form action={createMilestoneAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="goalId" value={goal.id} />
              <div className="flex-1">
                <Input name="title" placeholder="新阶段，例如：Java 集合框架" required />
              </div>
              <Button type="submit" variant="secondary" size="default">
                <Plus className="size-4" aria-hidden />
                添加
              </Button>
            </form>
          </section>
        </div>

        <aside>
          <h2 className="mb-3 text-base font-semibold text-ink">关联任务</h2>
          {goal.tasks.length === 0 ? (
            <p className="border border-dashed border-line px-4 py-8 text-sm text-secondary">
              还没有关联任务。
            </p>
          ) : (
            <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {goal.tasks.map((task) => (
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
        </aside>
      </div>
    </>
  );
}
