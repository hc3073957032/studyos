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
import { createNoteAction } from "@/lib/actions/studyos";
import {
  getCurrentUserId,
  listCourses,
  listKnowledge,
} from "@/lib/services/studyos";

export default async function NewNotePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const [courses, knowledge] = await Promise.all([
    listCourses(userId),
    listKnowledge(userId),
  ]);

  return (
    <>
      <Link href="/notes" className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        返回笔记
      </Link>
      <PageHeader title="新建笔记" description="记录你的理解、疑问和例子。" />

      <form action={createNoteAction} className="max-w-xl space-y-5">
        <FormField label="标题" htmlFor="title">
          <Input id="title" name="title" placeholder="集合框架笔记" required />
        </FormField>
        <FormField label="内容" htmlFor="content">
          <Textarea id="content" name="content" className="min-h-64" required />
        </FormField>
        <FormField label="标签" htmlFor="tags" hint="用逗号分隔，最多 8 个。">
          <Input id="tags" name="tags" placeholder="Java, 集合, 面试" />
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
            保存笔记
          </Button>
          <Link href="/notes">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
