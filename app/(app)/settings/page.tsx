import { redirect } from "next/navigation";
import { ImagePlus, LogOut, Palette, SlidersHorizontal, Trash2, UserRound } from "lucide-react";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  removeWallpaperAction,
  updateDisplaySettingsAction,
  uploadWallpaperAction,
} from "@/lib/actions/settings";
import { signOutAction } from "@/lib/actions/session";
import { updateProfileAction } from "@/lib/actions/studyos";
import { getCurrentUserId, getUserProfile, getUserSettings } from "@/lib/services/studyos";

const NAV_OPTIONS = [
  { id: "dashboard", label: "首页" },
  { id: "goals", label: "目标" },
  { id: "courses", label: "课程" },
  { id: "tasks", label: "任务" },
  { id: "focus", label: "专注" },
  { id: "reviews", label: "复习" },
  { id: "semesters", label: "学期" },
  { id: "plans", label: "计划" },
  { id: "materials", label: "资料架" },
  { id: "knowledge", label: "知识书" },
  { id: "notes", label: "笔记" },
  { id: "analytics", label: "分析" },
  { id: "settings", label: "设置" },
];

const MESSAGES: Record<string, string> = {
  display: "显示设置已保存。",
  wallpaper: "壁纸已更新。",
  "wallpaper-removed": "壁纸已移除。",
  "wallpaper-empty": "请选择一张图片。",
  "wallpaper-size": "图片不能超过 8 MB。",
  "wallpaper-format": "支持 JPG、PNG、WebP 和 GIF。",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const [profile, settings, params] = await Promise.all([
    getUserProfile(userId),
    getUserSettings(userId),
    searchParams,
  ]);
  if (!profile) redirect("/login");

  const messageKey = params.saved ?? params.error;
  const message = messageKey ? MESSAGES[messageKey] : null;
  const isError = Boolean(params.error);

  return (
    <>
      <PageHeader title="设置" description="把 StudyOS 调整成适合你的样子。" />

      {message ? (
        <p
          className={`mb-6 border px-4 py-3 text-sm ${
            isError
              ? "border-danger/20 bg-danger/10 text-danger"
              : "border-success/20 bg-success/10 text-success"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-10">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-secondary" aria-hidden />
              <h2 className="text-base font-semibold text-ink">侧边栏</h2>
            </div>
            <form action={updateDisplaySettingsAction} className="border border-line bg-surface p-5">
              <p className="mb-4 text-sm text-secondary">
                只保留你常用的模块，设置项会始终保留。
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {NAV_OPTIONS.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      name="sidebarItems"
                      value={item.id}
                      defaultChecked={settings.sidebarItems.includes(item.id)}
                      disabled={item.id === "settings"}
                      className="size-4 accent-accent"
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              <div className="mt-6 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-ink">
                  壁纸遮罩：{settings.wallpaperOpacity}%
                  <input
                    type="range"
                    name="wallpaperOpacity"
                    min="40"
                    max="100"
                    defaultValue={settings.wallpaperOpacity}
                    className="w-full accent-accent"
                  />
                </label>
                <label className="space-y-2 text-sm text-ink">
                  壁纸模糊：{settings.wallpaperBlur}px
                  <input
                    type="range"
                    name="wallpaperBlur"
                    min="0"
                    max="20"
                    defaultValue={settings.wallpaperBlur}
                    className="w-full accent-accent"
                  />
                </label>
              </div>

              <Button type="submit" variant="primary" className="mt-5">
                保存显示设置
              </Button>
            </form>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Palette className="size-4 text-secondary" aria-hidden />
              <h2 className="text-base font-semibold text-ink">壁纸</h2>
            </div>
            <div className="border border-line bg-surface p-5">
              {settings.wallpaperUrl ? (
                <div
                  className="mb-5 h-40 rounded-md border border-line bg-cover bg-center"
                  style={{ backgroundImage: `url(${settings.wallpaperUrl})` }}
                />
              ) : (
                <div className="mb-5 flex h-40 items-center justify-center rounded-md border border-dashed border-line text-sm text-secondary">
                  当前没有壁纸
                </div>
              )}
              <form action={uploadWallpaperAction} className="space-y-4">
                <FormField label="上传壁纸" htmlFor="wallpaper">
                  <Input id="wallpaper" name="wallpaper" type="file" accept="image/*" required />
                </FormField>
                <Button type="submit" variant="primary">
                  <ImagePlus className="size-4" aria-hidden />
                  上传并应用
                </Button>
              </form>
              {settings.wallpaperUrl ? (
                <form action={removeWallpaperAction} className="mt-3">
                  <Button type="submit" variant="ghost" className="text-danger hover:bg-danger/10">
                    <Trash2 className="size-4" aria-hidden />
                    移除壁纸
                  </Button>
                </form>
              ) : null}
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
              <UserRound className="size-4 text-secondary" aria-hidden />
              个人资料
            </h2>
            <form action={updateProfileAction} className="max-w-lg space-y-5">
              <FormField label="名称" htmlFor="name">
                <Input id="name" name="name" defaultValue={profile.name ?? ""} required />
              </FormField>
              <FormField label="邮箱" htmlFor="email">
                <Input id="email" defaultValue={profile.email ?? ""} disabled />
              </FormField>
              <Button type="submit" variant="primary">
                保存资料
              </Button>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center bg-accent-soft text-accent">
                <UserRound className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{profile.name ?? "学习者"}</p>
                <p className="truncate text-xs text-secondary">{profile.email}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-secondary">课程</dt>
                <dd className="mt-1 font-semibold text-ink">{profile._count.courses}</dd>
              </div>
              <div>
                <dt className="text-xs text-secondary">任务</dt>
                <dd className="mt-1 font-semibold text-ink">{profile._count.tasks}</dd>
              </div>
              <div>
                <dt className="text-xs text-secondary">笔记</dt>
                <dd className="mt-1 font-semibold text-ink">{profile._count.notes}</dd>
              </div>
              <div>
                <dt className="text-xs text-secondary">专注</dt>
                <dd className="mt-1 font-semibold text-ink">{profile._count.studySessions}</dd>
              </div>
            </dl>
          </div>

          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full">
              <LogOut className="size-4" aria-hidden />
              退出登录
            </Button>
          </form>
        </aside>
      </div>
    </>
  );
}