import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTaskAction } from "@/lib/actions/studyos";
import {
  getCurrentUserId,
  listCourses,
  listGoals,
  listSemesters,
} from "@/lib/services/studyos";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const params = await searchParams;
  const [courses, goals, semesters] = await Promise.all([
    listCourses(userId),
    listGoals(userId),
    listSemesters(userId),
  ]);

  return (
    <>
      <Link href="/tasks" className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        返回任务
      </Link>
      <PageHeader title="新建任务" description="给任务一个明确的时间和时长。" />

      <form action={createTaskAction} className="max-w-xl space-y-5">
        <FormField label="任务" htmlFor="title">
          <Input id="title" name="title" placeholder="数据结构 · 链表" required />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="课程" htmlFor="courseId">
            <Select id="courseId" name="courseId" defaultValue={params.courseId ?? ""}>
              <option value="">不关联</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="目标" htmlFor="goalId">
            <Select id="goalId" name="goalId" defaultValue="">
              <option value="">不关联</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="学期" htmlFor="semesterId">
            <Select id="semesterId" name="semesterId" defaultValue="">
              <option value="">不关联</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="优先级" htmlFor="priority">
            <Select id="priority" name="priority" defaultValue="MEDIUM">
              <option value="LOW">低</option>
              <option value="MEDIUM">中</option>
              <option value="HIGH">高</option>
              <option value="URGENT">紧急</option>
            </Select>
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="安排时间" htmlFor="scheduledAt">
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
          </FormField>
          <FormField label="截止日期" htmlFor="dueDate">
            <Input id="dueDate" name="dueDate" type="date" />
          </FormField>
        </div>
        <FormField label="预计时长（分钟）" htmlFor="estimatedMinutes">
          <Input id="estimatedMinutes" name="estimatedMinutes" type="number" min="0" placeholder="30" />
        </FormField>
        <FormField label="备注" htmlFor="description">
          <Textarea id="description" name="description" placeholder="需要完成什么？" />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            创建任务
          </Button>
          <Link href="/tasks">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
