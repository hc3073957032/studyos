import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Target, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { IconOrb } from "@/components/ui/icon-orb";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { deleteGoalAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listGoals } from "@/lib/services/studyos";

const goalTypeLabel = {
  LONG_TERM: "长期目标",
  SEMESTER: "学期目标",
  SKILL: "技能目标",
};

export default async function GoalsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const goals = await listGoals(userId);

  return (
    <>
      <PageHeader
        title="目标"
        description="让课程和任务有方向。"
        action={
          <Link href="/goals/new">
            <Button variant="primary">
              <Plus className="size-4" aria-hidden />
              新建目标
            </Button>
          </Link>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="还没有目标"
          description="从长期目标开始，例如“2026 年掌握 Java”。"
          actionLabel="创建目标"
          actionHref="/goals/new"
        />
      ) : (
        <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {goals.map((goal) => {
            const completedMilestones = goal.milestones.filter((item) => item.completed).length;
            return (
              <div key={goal.id} className="group flex items-center gap-4 px-4 py-4">
                <IconOrb icon={Target} tone="accent" className="soft-pop" />
                <Link href={`/goals/${goal.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{goal.title}</p>
                    <Badge variant={goal.type === "LONG_TERM" ? "accent" : "neutral"}>
                      {goalTypeLabel[goal.type]}
                    </Badge>
                    {goal.status === "COMPLETED" ? <Badge variant="success">已完成</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-secondary">
                    {goal.semester?.name ?? "未关联学期"} · {goal._count.tasks} 个任务 ·{" "}
                    {goal.milestones.length > 0
                      ? `${completedMilestones}/${goal.milestones.length} 个阶段`
                      : "还没有阶段"}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressRing value={goal.progress} size={42} stroke={4}>
                      <span className="text-[9px] font-semibold tabular-nums text-ink">{goal.progress}%</span>
                    </ProgressRing>
                    <span className="text-xs text-secondary">阶段完成度</span>
                  </div>
                </Link>
                <form action={deleteGoalAction}>
                  <input type="hidden" name="id" value={goal.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    title="删除目标"
                    className="opacity-60 group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
