import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSemesterAction } from "@/lib/actions/studyos";

function todayValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function NewSemesterPage() {
  return (
    <>
      <Link
        href="/semesters"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回学期
      </Link>
      <PageHeader title="新建学期" description="写下这一阶段的起止时间。" />

      <form action={createSemesterAction} className="max-w-xl space-y-5">
        <FormField label="名称" htmlFor="name">
          <Input id="name" name="name" placeholder="2026-2027 第一学期" required />
        </FormField>
        <FormField label="开始日期" htmlFor="startDate">
          <Input id="startDate" name="startDate" type="date" defaultValue={todayValue()} required />
        </FormField>
        <FormField label="结束日期" htmlFor="endDate">
          <Input id="endDate" name="endDate" type="date" />
        </FormField>
        <FormField label="描述" htmlFor="description">
          <Textarea id="description" name="description" placeholder="这个学期想完成什么？" />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="isActive" className="size-4 accent-accent" />
          设为当前学期
        </label>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            创建学期
          </Button>
          <Link href="/semesters">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
