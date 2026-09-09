import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, RefreshCcw, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { answerReviewAction, deleteReviewAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listReviews } from "@/lib/services/studyos";

export default async function ReviewsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const reviews = await listReviews(userId, true);

  return (
    <>
      <PageHeader
        title="今日复习"
        description="到期卡片会出现在这里。"
        action={
          <div className="flex gap-2">
            <Link href="/reviews/mistakes">
              <Button variant="secondary">错题</Button>
            </Link>
            <Link href="/reviews/new">
              <Button variant="primary">
                <Plus className="size-4" aria-hidden />
                新建复习
              </Button>
            </Link>
          </div>
        }
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={RefreshCcw}
          title="今天没有到期复习"
          description="可以添加新的复习卡，或去整理错题。"
          actionLabel="新建复习"
          actionHref="/reviews/new"
        />
      ) : (
        <div className="divide-y divide-line border border-line bg-surface">
          {reviews.map((review) => (
            <div key={review.id} className="px-4 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink">{review.question}</h2>
                    {review.course ? <Badge variant="neutral">{review.course.name}</Badge> : null}
                  </div>
                  {review.answer ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-secondary">
                      {review.answer}
                    </p>
                  ) : null}
                </div>
                <form action={deleteReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <Button type="submit" variant="ghost" size="icon" title="删除复习卡">
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </form>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(
                  [
                    ["again", "忘记"],
                    ["hard", "困难"],
                    ["good", "良好"],
                    ["easy", "轻松"],
                  ] as const
                ).map(([outcome, label]) => (
                  <form key={outcome} action={answerReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="outcome" value={outcome} />
                    <Button type="submit" variant="secondary" size="sm">
                      {label}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
