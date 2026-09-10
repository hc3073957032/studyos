export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/app-shell";
import {
  DEFAULT_SIDEBAR_ITEMS,
  getCurrentUserId,
  getUserProfile,
  getUserSettings,
} from "@/lib/services/studyos";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getCurrentUserId();
  const settings = await getUserSettings(userId!);
  const profile = await getUserProfile(userId!);

  return (
    <AppShell
      user={{
        name: profile?.name ?? "学习者",
        email: "本地数据",
      }}
      visibleSidebarItems={settings.sidebarItems ?? DEFAULT_SIDEBAR_ITEMS}
      wallpaperUrl={settings.wallpaperUrl}
      wallpaperOpacity={settings.wallpaperOpacity}
      wallpaperBlur={settings.wallpaperBlur}
      sidebarAutoHide={settings.sidebarAutoHide}
      sidebarHideDelay={settings.sidebarHideDelay}
    >
      {children}
    </AppShell>
  );
}