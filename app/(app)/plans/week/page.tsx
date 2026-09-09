import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PlanTabs } from "@/components/plan-tabs";
import { TaskRow } from "@/components/task-row";
import { CalendarRange } from "lucide-react";
import { addDays, endOfDay, startOfWeek } from "@/lib/algorithms/study";
import { getCurrentUserId, listTasks } from "@/lib/services/studyos";

export default async function WeekPlanPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const allTasks = await listTasks(userId);
  const start = startOfWeek(new Date());
  const end = endOfDay(addDays(start, 6));
  const tasks = allTasks.filter((task) => {
    const date = task.scheduledAt ?? task.dueDate;
    return date ? date >= start && date <= end : false;
  });

  return (
    <>
      <PlanTabs active="/plans/week" />
      <PageHeader title="本周计划" description="看看未来七天要完成什么。" />
      {tasks.length === 0 ? (
        <EmptyState icon={CalendarRange} title="本周还没有任务" description="可以把本周任务排到具体日期。" />
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
