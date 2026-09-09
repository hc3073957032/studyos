import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createReviewAction } from "@/lib/actions/studyos";
import {
  getCurrentUserId,
  listCourses,
  listKnowledge,
} from "@/lib/services/studyos";

export default async function NewReviewPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const [courses, knowledge] = await Promise.all([
    listCourses(userId),
    listKnowledge(userId),
  ]);

  return (
    <>
      <Link href="/reviews" className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        返回复习
      </Link>
      <PageHeader title="新建复习卡" description="写下一个问题，后面会按间隔出现。" />

      <form action={createReviewAction} className="max-w-xl space-y-5">
        <FormField label="问题" htmlFor="question">
          <Input id="question" name="question" placeholder="什么是红黑树的平衡条件？" required />
        </FormField>
        <FormField label="参考答案" htmlFor="answer">
          <Textarea id="answer" name="answer" placeholder="写下正确答案或提示。" />
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
          <FormField label="知识点" htmlFor="knowledgeId">
            <Select id="knowledgeId" name="knowledgeId" defaultValue="">
              <option value="">不关联</option>
              {knowledge.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField label="下次复习日期" htmlFor="dueAt">
          <Input id="dueAt" name="dueAt" type="date" />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            创建复习卡
          </Button>
          <Link href="/reviews">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
