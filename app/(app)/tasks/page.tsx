import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckSquare, Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TaskRow } from "@/components/task-row";
import { Button } from "@/components/ui/button";
import { getCurrentUserId, listTasks } from "@/lib/services/studyos";

export default async function TasksPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const tasks = await listTasks(userId);
  const active = tasks.filter((task) => task.status === "TODO" || task.status === "IN_PROGRESS");
  const completed = tasks.filter((task) => task.status === "COMPLETED").slice(0, 20);

  return (
    <>
      <PageHeader
        title="任务"
        description="把学习拆成可以执行的小步骤。"
        action={
          <Link href="/tasks/new">
            <Button variant="primary">
              <Plus className="size-4" aria-hidden />
              新建任务
            </Button>
          </Link>
        }
      />

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink">待办</h2>
        {active.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="没有待办任务"
            description="安排一个 20-30 分钟就能完成的小任务。"
            actionLabel="新建任务"
            actionHref="/tasks/new"
          />
        ) : (
          <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
            {active.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-base font-semibold text-ink">最近完成</h2>
          <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface opacity-70">
            {completed.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
