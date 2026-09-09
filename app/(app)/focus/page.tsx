import { redirect } from "next/navigation";
import { Timer } from "lucide-react";

import { FocusConsole } from "@/components/focus/focus-console";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentUserId,
  getDashboardData,
  listCourses,
  listTasks,
} from "@/lib/services/studyos";

export default async function FocusPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const params = await searchParams;
  const [courses, tasks, dashboard] = await Promise.all([
    listCourses(userId),
    listTasks(userId),
    getDashboardData(userId),
  ]);

  return (
    <>
      <PageHeader title="专注" description="选择任务，进入一段不被打扰的时间。" />
      <FocusConsole
        courses={courses.map((course) => ({ id: course.id, name: course.name }))}
        tasks={tasks.map((task) => ({ id: task.id, title: task.title }))}
        initialTaskId={params.taskId}
        activeSession={
          dashboard.activeSession
            ? {
                id: dashboard.activeSession.id,
                startedAt: dashboard.activeSession.startAt.toISOString(),
              }
            : undefined
        }
      />
      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-secondary">
        <Timer className="size-4" aria-hidden />
        学习时长由服务器按真实开始与结束时间记录
      </p>
    </>
  );
}
