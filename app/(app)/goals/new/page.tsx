import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createGoalAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listSemesters } from "@/lib/services/studyos";

export default async function NewGoalPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const semesters = await listSemesters(userId);

  return (
    <>
      <Link
        href="/goals"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回目标
      </Link>
      <PageHeader title="新建目标" description="先定义清楚要达成什么。" />

      <form action={createGoalAction} className="max-w-xl space-y-5">
        <FormField label="目标类型" htmlFor="type">
          <Select id="type" name="type" defaultValue="LONG_TERM">
            <option value="LONG_TERM">长期目标</option>
            <option value="SEMESTER">学期目标</option>
            <option value="SKILL">技能目标</option>
          </Select>
        </FormField>
        <FormField label="目标名称" htmlFor="title">
          <Input id="title" name="title" placeholder="2026 年掌握 Java" required />
        </FormField>
        <FormField label="完成标准" htmlFor="targetMetric">
          <Input
            id="targetMetric"
            name="targetMetric"
            placeholder="例如：独立完成一个 Spring Boot 项目"
          />
        </FormField>
        <FormField label="截止日期" htmlFor="dueDate">
          <Input id="dueDate" name="dueDate" type="date" />
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
        <FormField label="描述" htmlFor="description">
          <Textarea id="description" name="description" placeholder="为什么设定这个目标？" />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            创建目标
          </Button>
          <Link href="/goals">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
