import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Check,
  Circle,
  Clock3,
  Columns3,
  Play,
  Plus,
  Rows3,
  Trash2,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { deleteTaskAction, setTaskStatusAction } from "@/lib/actions/studyos";
import { endOfDay, startOfDay } from "@/lib/algorithms/study";
import { formatMinutes } from "@/lib/utils";
import { getCurrentUserId, listTasks } from "@/lib/services/studyos";

type TaskItem = Awaited<ReturnType<typeof listTasks>>[number];

const priorityLabel = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

const priorityColor = {
  LOW: "#8e8e93",
  MEDIUM: "#0071e3",
  HIGH: "#b25000",
  URGENT: "#c7222d",
};

function taskDate(task: TaskItem) {
  return task.scheduledAt ?? task.dueDate;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function StatusButton({
  task,
  status,
  icon,
  label,
}: {
  task: TaskItem;
  status: string;
  icon: "start" | "complete" | "restore";
  label: string;
}) {
  const Icon = icon === "start" ? Play : icon === "complete" ? Check : Circle;
  return (
    <form action={setTaskStatusAction}>
      <input type="hidden" name="id" value={task.id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="secondary" size="sm">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </Button>
    </form>
  );
}

function TimelineTask({ task }: { task: TaskItem }) {
  const date = taskDate(task);
  return (
    <div className="group flex items-center gap-4 py-4 transition-colors hover:bg-subtle/35">
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[15px] font-medium text-ink">{task.title}</p>
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: priorityColor[task.priority] }}
            title={`优先级：${priorityLabel[task.priority]}`}
          />
        </div>
        <p className="mt-1 truncate text-xs text-secondary">
          {task.course?.name ?? task.goal?.title ?? task.chapter?.title ?? "未分类"}
          {task.estimatedMinutes ? ` · ${formatMinutes(task.estimatedMinutes)}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {date ? (
          <span className="hidden text-xs tabular-nums text-secondary sm:block">
            {new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date)}
          </span>
        ) : null}
        <Link
          href={`/focus?taskId=${task.id}`}
          className="flex size-8 items-center justify-center rounded-full text-secondary opacity-0 transition-all hover:bg-subtle hover:text-accent group-hover:opacity-100"
          title="开始专注"
        >
          <Play className="size-3.5" aria-hidden />
        </Link>
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <Button type="submit" variant="ghost" size="icon" title="删除任务" className="rounded-full opacity-0 group-hover:opacity-100">
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </form>
      </div>
    </div>
  );
}

function TaskGroup({ title, tasks, hint }: { title: string; tasks: TaskItem[]; hint?: string }) {
  if (tasks.length === 0) return null;
  return (
    <section className="mb-8">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {hint ? <p className="mt-0.5 text-xs text-secondary">{hint}</p> : null}
        </div>
        <span className="text-xs tabular-nums text-secondary">{tasks.length}</span>
      </div>
      <div className="divide-y divide-line/70 border-y border-line/70">
        {tasks.map((task) => (
          <TimelineTask key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

function BoardCard({ task }: { task: TaskItem }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-22px_rgba(0,0,0,0.35)]">
      <div className="flex items-start gap-3">
        <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: priorityColor[task.priority] }} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-5 text-ink">{task.title}</p>
          <p className="mt-1 text-xs text-secondary">
            {task.course?.name ?? task.goal?.title ?? "未分类"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={task.priority === "URGENT" ? "danger" : task.priority === "HIGH" ? "warning" : "neutral"}>
          {priorityLabel[task.priority]}
        </Badge>
        {task.estimatedMinutes ? (
          <span className="flex items-center gap-1 text-xs text-secondary">
            <Clock3 className="size-3.5" aria-hidden />
            {formatMinutes(task.estimatedMinutes)}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-line/70 pt-3">
        {task.status === "TODO" ? <StatusButton task={task} status="IN_PROGRESS" icon="start" label="开始" /> : null}
        {task.status === "IN_PROGRESS" ? (
          <>
            <StatusButton task={task} status="COMPLETED" icon="complete" label="完成" />
            <StatusButton task={task} status="TODO" icon="restore" label="放回" />
          </>
        ) : null}
        {task.status === "COMPLETED" ? <StatusButton task={task} status="TODO" icon="restore" label="恢复" /> : null}
        <Link
          href={`/focus?taskId=${task.id}`}
          className="ml-auto inline-flex size-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-subtle hover:text-accent"
          title="开始专注"
        >
          <Play className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const params = await searchParams;
  const view = params.view === "board" ? "board" : "timeline";
  const tasks = await listTasks(userId);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const active = tasks.filter((task) => task.status !== "COMPLETED" && task.status !== "CANCELLED");
  const completed = tasks.filter((task) => task.status === "COMPLETED");
  const todayTasks = tasks.filter((task) => {
    const date = taskDate(task);
    return date ? isSameDay(date, now) : false;
  });
  const completedToday = todayTasks.filter((task) => task.status === "COMPLETED");
  const todayProgress = todayTasks.length > 0 ? Math.round((completedToday.length / todayTasks.length) * 100) : 0;
  const plannedMinutes = active.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0);
  const overdue = active.filter((task) => {
    const date = taskDate(task);
    return date ? date < todayStart : false;
  });
  const todayActive = active.filter((task) => {
    const date = taskDate(task);
    return date ? date >= todayStart && date <= todayEnd : false;
  });
  const upcoming = active.filter((task) => {
    const date = taskDate(task);
    return date ? date > todayEnd : false;
  });
  const unscheduled = active.filter((task) => !taskDate(task));

  return (
    <>
      <PageHeader
        title="任务"
        description="今天要完成什么，一眼看得到。"
        action={
          <Link href="/tasks/new">
            <Button variant="primary" className="rounded-full">
              <Plus className="size-4" aria-hidden />
              新建任务
            </Button>
          </Link>
        }
      />

      <section className="mb-8 grid gap-6 border-y border-line/70 py-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex justify-center sm:justify-start">
          <ProgressRing value={todayProgress} size={112} stroke={6}>
            <div className="text-center">
              <p className="text-2xl font-semibold tabular-nums text-ink">{todayProgress}%</p>
              <p className="text-[10px] text-secondary">今日完成</p>
            </div>
          </ProgressRing>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-secondary">待处理</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{active.length}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">预计专注</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{formatMinutes(plannedMinutes)}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">今日完成</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{completedToday.length}</p>
          </div>
        </div>
      </section>

      <nav className="mb-8 inline-flex rounded-full border border-line bg-surface p-1">
        <Link
          href="/tasks"
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
            view === "timeline" ? "bg-ink text-white" : "text-secondary hover:text-ink"
          }`}
        >
          <Rows3 className="size-4" aria-hidden />
          时间线
        </Link>
        <Link
          href="/tasks?view=board"
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
            view === "board" ? "bg-ink text-white" : "text-secondary hover:text-ink"
          }`}
        >
          <Columns3 className="size-4" aria-hidden />
          看板
        </Link>
      </nav>

      {active.length === 0 && completed.length === 0 ? (
        <EmptyState
          icon={Check}
          title="还没有任务"
          description="写下一个具体、可完成的小任务，开始今天的节奏。"
          actionLabel="新建任务"
          actionHref="/tasks/new"
        />
      ) : view === "board" ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ["待办", tasks.filter((task) => task.status === "TODO")],
            ["进行中", tasks.filter((task) => task.status === "IN_PROGRESS")],
            ["已完成", completed.slice(0, 20)],
          ].map(([title, items]) => (
            <section key={title as string} className="min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">{title as string}</h2>
                <span className="text-xs text-secondary">{(items as TaskItem[]).length}</span>
              </div>
              <div className="space-y-3">
                {(items as TaskItem[]).map((task) => (
                  <BoardCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <>
          <TaskGroup title="逾期" tasks={overdue} hint="需要先处理" />
          <TaskGroup title="今天" tasks={todayActive} hint={`${todayActive.length} 项`} />
          <TaskGroup title="接下来" tasks={upcoming} />
          <TaskGroup title="未安排" tasks={unscheduled} />
          <TaskGroup title="最近完成" tasks={completed.slice(0, 10)} />
        </>
      )}
    </>
  );
}