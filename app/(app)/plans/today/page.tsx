import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PlanTabs } from "@/components/plan-tabs";
import { TaskRow } from "@/components/task-row";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/utils";
import { getCurrentUserId, listTasks } from "@/lib/services/studyos";

export default async function TodayPlanPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const tasks = await listTasks(userId, new Date());
  const openTasks = tasks.filter((task) => task.status !== "COMPLETED");
  const plannedMinutes = openTasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0);

  return (
    <>
      <PlanTabs active="/plans/today" />
      <PageHeader
        title="今日计划"
        description={`${openTasks.length} 个任务 · ${formatMinutes(plannedMinutes)}`}
        action={
          <Link href="/tasks/new">
            <Button variant="primary">
              <Plus className="size-4" aria-hidden />
              添加任务
            </Button>
          </Link>
        }
      />
      {tasks.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="今天还没有安排"
          description="给今天的清单加一件具体、可完成的事。"
          actionLabel="安排任务"
          actionHref="/tasks/new"
        />
      ) : (
        <div className="divide-y divide-line border border-line bg-surface">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </>
  );
}
