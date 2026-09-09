import { Select } from "@/components/ui/select";

type CourseOption = {
  id: string;
  name: string;
  chapters: { id: string; title: string; order: number }[];
};

export function ChapterSelect({
  courses,
  defaultValue = "",
}: {
  courses: CourseOption[];
  defaultValue?: string;
}) {
  return (
    <Select id="chapterId" name="chapterId" defaultValue={defaultValue}>
      <option value="">不关联章节</option>
      {courses.map((course) =>
        course.chapters.map((chapter) => (
          <option key={chapter.id} value={chapter.id}>
            {course.name} · {chapter.title}
          </option>
        )),
      )}
    </Select>
  );
}
