import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCourseAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listSemesters } from "@/lib/services/studyos";

export default async function NewCoursePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const semesters = await listSemesters(userId);

  return (
    <>
      <Link
        href="/courses"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回课程
      </Link>
      <PageHeader title="新建课程" description="把学习资料、章节与任务放进同一门课程。" />

      <form action={createCourseAction} className="max-w-xl space-y-5">
        <FormField label="课程名称" htmlFor="name">
          <Input id="name" name="name" placeholder="Java 程序设计" required />
        </FormField>
        <FormField label="关联学期" htmlFor="semesterId">
          <Select id="semesterId" name="semesterId" defaultValue="">
            <option value="">不关联</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="颜色" htmlFor="color">
          <div className="flex items-center gap-3">
            <input
              id="color"
              name="color"
              type="color"
              defaultValue="#006edb"
              className="h-10 w-16 cursor-pointer overflow-hidden rounded-md border border-line bg-surface p-1"
            />
            <span className="text-sm text-secondary">课程标记颜色</span>
          </div>
        </FormField>
        <FormField label="描述" htmlFor="description">
          <Textarea id="description" name="description" placeholder="这门课学什么？" />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            创建课程
          </Button>
          <Link href="/courses">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
