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
import { createMistakeAction } from "@/lib/actions/studyos";
import {
  getCurrentUserId,
  listCourses,
  listKnowledge,
} from "@/lib/services/studyos";

export default async function NewMistakePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const [courses, knowledge] = await Promise.all([
    listCourses(userId),
    listKnowledge(userId),
  ]);

  return (
    <>
      <Link href="/reviews/mistakes" className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        返回错题
      </Link>
      <PageHeader title="添加错题" description="把错题和知识点关联起来。" />

      <form action={createMistakeAction} className="max-w-xl space-y-5">
        <FormField label="题目" htmlFor="question">
          <Textarea id="question" name="question" placeholder="题目或问题描述" required />
        </FormField>
        <FormField label="我的答案" htmlFor="myAnswer">
          <Textarea id="myAnswer" name="myAnswer" />
        </FormField>
        <FormField label="正确答案" htmlFor="correctAnswer">
          <Textarea id="correctAnswer" name="correctAnswer" />
        </FormField>
        <FormField label="错误原因" htmlFor="reason">
          <Input id="reason" name="reason" placeholder="概念混淆、粗心、方法不熟……" />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="课程" htmlFor="courseId">
            <Select id="courseId" name="courseId" defaultValue="">
              <option value="">无</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="知识点" htmlFor="knowledgeId">
            <Select id="knowledgeId" name="knowledgeId" defaultValue="">
              <option value="">无</option>
              {knowledge.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
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
            添加错题
          </Button>
          <Link href="/reviews/mistakes">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
