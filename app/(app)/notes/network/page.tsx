import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Network } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { KnowledgeGraph } from "@/components/network/knowledge-graph";
import { PageHeader } from "@/components/page-header";
import { buildKnowledgeNetwork, getCurrentUserId } from "@/lib/services/studyos";

export default async function NotesNetworkPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const graph = await buildKnowledgeNetwork(userId);

  return (
    <>
      <Link
        href="/notes"
        className="mb-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        返回笔记
      </Link>
      <PageHeader
        title="知识网络"
        description="笔记按标签、课程、章节与知识点自动相连。"
      />

      {graph.nodes.length === 0 ? (
        <EmptyState
          icon={Network}
          title="还没有可连接的笔记"
          description="先创建两篇带相同标签或相同课程的笔记，它们会自动出现在同一张网络里。"
          actionLabel="新建笔记"
          actionHref="/notes/new"
        />
      ) : graph.links.length === 0 ? (
        <EmptyState
          icon={Network}
          title="笔记还没有连接"
          description="给笔记添加相同标签，或关联同一门课程，连接就会自动出现。"
          actionLabel="新建笔记"
          actionHref="/notes/new"
        />
      ) : (
        <KnowledgeGraph nodes={graph.nodes} links={graph.links} />
      )}
    </>
  );
}
