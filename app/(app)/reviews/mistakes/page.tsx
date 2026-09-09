import Link from "next/link";
import { redirect } from "next/navigation";
import { BookX, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteMistakeAction,
  setMistakeStatusAction,
} from "@/lib/actions/studyos";
import { getCurrentUserId, listMistakes } from "@/lib/services/studyos";

export default async function MistakesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const mistakes = await listMistakes(userId);

  return (
    <>
      <PageHeader
        title="错题"
        description="错误是下一步学习的信号。"
        action={
          <div className="flex gap-2">
            <Link href="/reviews">
              <Button variant="secondary">复习</Button>
            </Link>
            <Link href="/reviews/mistakes/new">
              <Button variant="primary">
                <Plus className="size-4" aria-hidden />
                添加错题
              </Button>
            </Link>
          </div>
        }
      />

      {mistakes.length === 0 ? (
        <EmptyState
          icon={BookX}
          title="还没有错题"
          description="遇到不会的题就记下来，之后反复巩固。"
          actionLabel="添加错题"
          actionHref="/reviews/mistakes/new"
        />
      ) : (
        <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {mistakes.map((mistake) => (
            <div key={mistake.id} className="px-4 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{mistake.question}</p>
                  <div className="mt-2 space-y-1 text-sm text-secondary">
                    {mistake.myAnswer ? (
                      <p>
                        <span className="text-danger">我的答案：</span>
                        {mistake.myAnswer}
                      </p>
                    ) : null}
                    {mistake.correctAnswer ? (
                      <p>
                        <span className="text-success">正确答案：</span>
                        {mistake.correctAnswer}
                      </p>
                    ) : null}
                    {mistake.reason ? (
                      <p>
                        <span className="text-ink">原因：</span>
                        {mistake.reason}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mistake.course ? <Badge variant="neutral">{mistake.course.name}</Badge> : null}
                    {mistake.knowledge ? <Badge variant="accent">{mistake.knowledge.title}</Badge> : null}
                    <Badge variant={mistake.status === "MASTERED" ? "success" : "warning"}>
                      {mistake.status === "MASTERED" ? "已掌握" : "待巩固"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <form action={setMistakeStatusAction}>
                    <input type="hidden" name="id" value={mistake.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={mistake.status === "MASTERED" ? "ACTIVE" : "MASTERED"}
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      {mistake.status === "MASTERED" ? "重新学习" : "标记掌握"}
                    </Button>
                  </form>
                  <form action={deleteMistakeAction}>
                    <input type="hidden" name="id" value={mistake.id} />
                    <Button type="submit" variant="ghost" size="icon" title="删除错题">
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
