import { redirect } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";

import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOutAction } from "@/lib/actions/session";
import { updateProfileAction } from "@/lib/actions/studyos";
import { getCurrentUserId, getUserProfile } from "@/lib/services/studyos";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const profile = await getUserProfile(userId);
  if (!profile) redirect("/login");

  return (
    <>
      <PageHeader title="设置" description="管理个人资料与账户。" />

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-ink">个人资料</h2>
          <form action={updateProfileAction} className="max-w-lg space-y-5">
            <FormField label="名称" htmlFor="name">
              <Input id="name" name="name" defaultValue={profile.name ?? ""} required />
            </FormField>
            <FormField label="邮箱" htmlFor="email">
              <Input id="email" defaultValue={profile.email ?? ""} disabled />
            </FormField>
            <Button type="submit" variant="primary">
              保存
            </Button>
          </form>
        </section>

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
