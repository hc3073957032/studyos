import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PlanTabs } from "@/components/plan-tabs";
import { TaskRow } from "@/components/task-row";
import { CalendarDays } from "lucide-react";
import { getCurrentUserId, listTasks } from "@/lib/services/studyos";

export default async function MonthPlanPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const allTasks = await listTasks(userId);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const tasks = allTasks.filter((task) => {
    const date = task.scheduledAt ?? task.dueDate;
    return date ? date >= monthStart && date <= monthEnd : false;
  });

  return (
    <>
      <PlanTabs active="/plans/month" />
      <PageHeader title="本月计划" description="从月份尺度安排学习。" />
      {tasks.length === 0 ? (
        <EmptyState icon={CalendarDays} title="本月还没有任务" description="把目标拆成本月的里程碑。" />
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
