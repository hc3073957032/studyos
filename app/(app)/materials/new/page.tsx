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
import { createMaterialAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listCourses } from "@/lib/services/studyos";

export default async function NewMaterialPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const courses = await listCourses(userId);

  return (
    <>
      <Link href="/materials" className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        返回资料
      </Link>
      <PageHeader title="添加资料" description="保存链接或记录文件位置。" />

      <form action={createMaterialAction} className="max-w-xl space-y-5">
        <FormField label="名称" htmlFor="name">
          <Input id="name" name="name" placeholder="数据结构第 3 章课件" required />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="类型" htmlFor="type">
            <Select id="type" name="type" defaultValue="WEB">
              <option value="PDF">PDF</option>
              <option value="PPT">PPT</option>
              <option value="DOC">文档</option>
              <option value="WEB">网页</option>
              <option value="VIDEO">视频</option>
              <option value="IMAGE">图片</option>
              <option value="TEXT">文本</option>
            </Select>
          </FormField>
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
        </div>
        <FormField label="链接" htmlFor="url">
          <Input id="url" name="url" type="url" placeholder="https://…" />
        </FormField>
        <FormField label="章节" htmlFor="chapterId">
          <ChapterSelect courses={courses} />
        </FormField>
        <FormField label="备注" htmlFor="description">
          <Textarea id="description" name="description" placeholder="这份资料重点看哪里？" />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            保存资料
          </Button>
          <Link href="/materials">
            <Button type="button" variant="ghost">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
