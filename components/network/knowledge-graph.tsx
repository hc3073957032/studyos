"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

export type GraphNode = SimulationNodeDatum & {
  id: string;
  title: string;
  group: string;
  tags: string[];
  course: string | null;
  knowledge: string | null;
};

type GraphLink = SimulationLinkDatum<GraphNode> & {
  strength: number;
};
function resolveLinkId(link: GraphLink, key: "source" | "target"): string {
  const value = link[key];
  if (value !== null && typeof value === "object") {
    return value.id;
  }
  return String(value);
}

export function KnowledgeGraph({
  nodes,
  links,
}: {
  nodes: Omit<GraphNode, "x" | "y" | "vx" | "vy">[];
  links: { source: string; target: string; strength: number }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const element: HTMLCanvasElement = canvasElement;
    const ctx = element.getContext("2d");
    if (!ctx) return;

    const width = element.clientWidth;
    const height = element.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    element.width = width * dpr;
    element.height = height * dpr;
    ctx.scale(dpr, dpr);

    const graphNodes = nodes.map((node) => ({
      ...node,
      x: width / 2 + (Math.random() - 0.5) * width * 0.5,
      y: height / 2 + (Math.random() - 0.5) * height * 0.5,
    }));
    const graphLinks = links.map((link) => ({ ...link, source: link.source, target: link.target }));

    const simulation = forceSimulation<GraphNode>(graphNodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(graphLinks)
          .id((node) => node.id)
          .distance((link) => Math.max(70, 130 - link.strength * 8))
          .strength((link) => Math.min(0.7, 0.12 + link.strength * 0.04)),
      )
      .force("charge", forceManyBody<GraphNode>().strength(-220))
      .force("collide", forceCollide<GraphNode>().radius(24).strength(0.6))
      .force("center", forceCenter(width / 2, height / 2))
      .alpha(0.7)
      .alphaDecay(0.0025)
      .velocityDecay(0.24);

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const now = Date.now();
      const nodeById = new Map(graphNodes.map((node) => [node.id, node]));
      const focused = focusRef.current;

      graphLinks.forEach((link, index) => {
        const source = typeof link.source === "object" && link.source !== null ? link.source : nodeById.get(String(link.source));
        const target = typeof link.target === "object" && link.target !== null ? link.target : nodeById.get(String(link.target));
        if (!source || !target) return;
        const sourceId = resolveLinkId(link, "source");
        const targetId = resolveLinkId(link, "target");
        const related = focused ? sourceId === focused || targetId === focused : false;
        const pulse = 0.22 + Math.abs(Math.sin(now / 1800 + index * 0.35)) * 0.14;
        ctx.beginPath();
        ctx.moveTo(source.x ?? 0, source.y ?? 0);
        ctx.lineTo(target.x ?? 0, target.y ?? 0);
        ctx.strokeStyle = related ? "rgba(0,113,227,0.55)" : "rgba(0,0,0,0.09)";
        ctx.lineWidth = related ? 1.6 : 1;
        ctx.globalAlpha = related ? 1 : pulse;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      graphNodes.forEach((node) => {
        const related = node.id === focused;
        const connectedToFocus =
          focused === null ||
          related ||
          graphLinks.some((link) => {
            const sourceId = resolveLinkId(link, "source");
            const targetId = resolveLinkId(link, "target");
            return sourceId === focused || targetId === focused;
          });
        ctx.globalAlpha = connectedToFocus ? 1 : 0.3;
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, related ? 9 : 6.5, 0, Math.PI * 2);
        ctx.fillStyle = related ? "#0071e3" : node.group || "#0071e3";
        ctx.fill();
        ctx.strokeStyle = related ? "#ffffff" : "rgba(255,255,255,0.9)";
        ctx.lineWidth = related ? 2 : 1;
        ctx.stroke();
        if (related) {
          ctx.font = "12px system-ui";
          const labelWidth = ctx.measureText(node.title).width;
          const x = (node.x ?? 0) + 12;
          const y = (node.y ?? 0) - 10;
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.fillRect(x - 4, y - 16, Math.min(labelWidth + 8, 260), 20);
          ctx.fillStyle = "#1d1d1f";
          ctx.fillText(node.title.length > 30 ? `${node.title.slice(0, 30)}…` : node.title, x, y);
        }
        ctx.globalAlpha = 1;
      });

      frame = requestAnimationFrame(draw);
    };
    draw();

    function handleClick(event: MouseEvent) {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const node = graphNodes.find((item) => {
        const dx = (item.x ?? 0) - x;
        const dy = (item.y ?? 0) - y;
        return Math.sqrt(dx * dx + dy * dy) < 16;
      });
      const id = node?.id ?? null;
      focusRef.current = id;
      setSelectedId(id);
    }

    function handleMove(event: MouseEvent) {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const node = graphNodes.find((item) => {
        const dx = (item.x ?? 0) - x;
        const dy = (item.y ?? 0) - y;
        return Math.sqrt(dx * dx + dy * dy) < 16;
      });
      focusRef.current = node?.id ?? null;
      element.style.cursor = node ? "pointer" : "default";
    }

    element.addEventListener("click", handleClick);
    element.addEventListener("mousemove", handleMove);

    return () => {
      cancelAnimationFrame(frame);
      simulation.stop();
      element.removeEventListener("click", handleClick);
      element.removeEventListener("mousemove", handleMove);
    };
  }, [nodes, links]);

  const selected = nodes.find((node) => node.id === selectedId) ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
      <div className="relative h-[520px] overflow-hidden rounded-md border border-line bg-canvas">
        <canvas ref={canvasRef} className="h-full w-full" />
        <div className="pointer-events-none absolute bottom-3 left-3 text-xs text-secondary/70">
          连接越近，说明两篇笔记的标签、课程或知识点越相关
        </div>
      </div>
      <aside className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">{selected ? "选中笔记" : "知识网络"}</h2>
          {selected ? (
            <div className="mt-3 border border-line bg-surface p-4">
              <Link href={`/notes/${selected.id}`} className="text-sm font-semibold text-accent hover:text-accent/80">
                {selected.title}
              </Link>
              <p className="mt-2 text-xs leading-5 text-secondary">
                {selected.course ?? "未关联课程"}
                {selected.knowledge ? ` · ${selected.knowledge}` : ""}
              </p>
              {selected.tags.length > 0 ? (
                <p className="mt-3 flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="bg-subtle px-1.5 py-0.5 text-xs text-secondary">
                      #{tag}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-xs leading-5 text-secondary">
              点击任意节点查看笔记入口，悬停可看到关联高亮。
            </p>
          )}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">节点</h2>
          <p className="mt-1 text-xs text-secondary">{nodes.length} 篇笔记</p>
        </div>
      </aside>
    </div>
  );
}