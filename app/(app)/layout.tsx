import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";
import { DEFAULT_SIDEBAR_ITEMS, getUserSettings } from "@/lib/services/studyos";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const settings = await getUserSettings(session.user.id);

  return (
    <AppShell
      user={{
        name: session.user.name ?? "学习者",
        email: session.user.email ?? "",
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