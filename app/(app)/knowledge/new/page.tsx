import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ChapterSelect } from "@/components/chapter-select";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createKnowledgeAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listCourses } from "@/lib/services/studyos";

export default async function NewKnowledgePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const courses = await listCourses(userId);

  return (
    <>
      <Link href="/knowledge" className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        返回知识库
      </Link>
      <PageHeader title="新建知识点" description="写清概念、结论与适用范围。" />

      <form action={createKnowledgeAction} className="max-w-xl space-y-5">
        <FormField label="知识点" htmlFor="title">
          <Input id="title" name="title" placeholder="HashMap 的工作原理" required />
        </FormField>
        <FormField label="摘要" htmlFor="summary">
          <Textarea id="summary" name="summary" placeholder="一句话解释这个知识点。" />
        </FormField>
        <FormField label="详细内容" htmlFor="content">
          <Textarea id="content" name="content" className="min-h-48" placeholder="Markdown 或普通文本都可以。" />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="课程" htmlFor="courseId">
            <Select id="courseId" name="courseId" defaultValue="">
              <option value="">不关联</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="章节" htmlFor="chapterId">
            <ChapterSelect courses={courses} />
          </FormField>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            创建知识点
          </Button>
          <Link href="/knowledge">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
