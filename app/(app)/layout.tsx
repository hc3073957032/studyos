import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.user.name ?? "学习者",
        email: session.user.email ?? "",
      }}
    >
      {children}
    </AppShell>
  );
}
