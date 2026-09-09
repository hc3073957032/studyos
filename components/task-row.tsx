import Link from "next/link";
import { Check, Circle, Play, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteTaskAction, setTaskStatusAction } from "@/lib/actions/studyos";

type TaskRowData = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  scheduledAt: Date | null;
  estimatedMinutes: number | null;
  course?: { id: string; name: string; color: string } | null;
  goal?: { id: string; title: string } | null;
  chapter?: { id: string; title: string } | null;
};

function StatusForm({ task, status, icon, label }: { task: TaskRowData; status: string; icon: "play" | "check" | "back"; label: string }) {
  const Icon = icon === "play" ? Play : icon === "check" ? Check : Circle;
  return (
    <form action={setTaskStatusAction}>
      <input type="hidden" name="id" value={task.id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="ghost" size="icon" title={label}>
        <Icon className="size-4" aria-hidden />
      </Button>
    </form>
  );
}

export function TaskRow({ task }: { task: TaskRowData }) {
  const time = task.scheduledAt
    ? new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(task.scheduledAt)
    : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${task.status === "COMPLETED" ? "text-secondary line-through" : "text-ink"}`}>
          {task.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-secondary">
          {task.course?.name ?? task.goal?.title ?? task.chapter?.title ?? "未分类"}
          {time ? ` · ${time}` : ""}
          {task.estimatedMinutes ? ` · ${task.estimatedMinutes} min` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {task.status === "TODO" || task.status === "IN_PROGRESS" ? (
          <StatusForm task={task} status="COMPLETED" icon="check" label="完成任务" />
        ) : (
          <StatusForm task={task} status="TODO" icon="back" label="恢复任务" />
        )}
        {task.status === "TODO" ? (
          <Link
            href={`/focus?taskId=${task.id}`}
            className="flex size-9 items-center justify-center text-secondary transition-colors hover:bg-subtle hover:text-accent"
            title="开始专注"
          >
            <Play className="size-4" aria-hidden />
          </Link>
        ) : null}
        {task.status !== "IN_PROGRESS" ? null : (
          <StatusForm task={task} status="TODO" icon="back" label="放回待办" />
        )}
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <Button type="submit" variant="ghost" size="icon" title="删除任务">
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </form>
      </div>
    </div>
  );
}
