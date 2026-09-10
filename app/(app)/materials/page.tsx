import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderOpen, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { KnowledgeTabs } from "@/components/knowledge-tabs";
import { Button } from "@/components/ui/button";
import { IconOrb } from "@/components/ui/icon-orb";
import { deleteMaterialAction } from "@/lib/actions/studyos";
import { getCurrentUserId, listMaterials } from "@/lib/services/studyos";

const typeLabels: Record<string, string> = {
  PDF: "PDF",
  PPT: "PPT",
  DOC: "文档",
  WEB: "网页",
  VIDEO: "视频",
  IMAGE: "图片",
  TEXT: "文本",
};

export default async function MaterialsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const materials = await listMaterials(userId);

  return (
    <>
      <KnowledgeTabs active="/materials" />
      <PageHeader
        title="资料架"
        description="外部来源：PDF、网页、视频和文档。"
        action={
          <Link href="/materials/new">
            <Button variant="primary">
              <Plus className="size-4" aria-hidden />
              添加资料
            </Button>
          </Link>
        }
      />

      {materials.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="还没有资料"
          description="把教材、视频链接或课程网页集中放在这里。"
          actionLabel="添加资料"
          actionHref="/materials/new"
        />
      ) : (
        <div className="overflow-hidden rounded-md divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {materials.map((material) => (
            <div key={material.id} className="group flex items-center gap-4 px-4 py-3">
              <IconOrb icon={FolderOpen} tone="accent" className="soft-pop" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{material.name}</p>
                <p className="mt-0.5 text-xs text-secondary">
                  {material.course?.name ?? "未关联课程"}
                  {material.chapter ? ` · ${material.chapter.title}` : ""}
                </p>
              </div>
              <Badge variant="neutral">{typeLabels[material.type] ?? material.type}</Badge>
              {material.url ? (
                <Link href={material.url} target="_blank" className="text-sm text-accent hover:text-accent/80">
                  打开
                </Link>
              ) : null}
              <form action={deleteMaterialAction}>
                <input type="hidden" name="id" value={material.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  title="删除资料"
                  className="opacity-60 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
