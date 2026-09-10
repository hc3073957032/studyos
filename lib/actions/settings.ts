"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/services/studyos";
import { clampSetting, normalizeSidebarItems, WALLPAPER_EXTENSIONS } from "@/lib/settings";

async function requireUserId() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  return userId;
}

function wallpaperDirectory() {
  return (
    process.env.STUDYOS_UPLOAD_DIR ??
    path.join(process.cwd(), "public", "uploads", "wallpapers")
  );
}

function localWallpaperPath(url: string | null) {
  let filename: string | null = null;
  if (url?.startsWith("/api/wallpaper/")) {
    filename = path.basename(url);
  } else if (url?.startsWith("/uploads/wallpapers/")) {
    filename = path.basename(url);
  }
  return filename ? path.join(/* turbopackIgnore: true */ wallpaperDirectory(), filename) : null;
}

export async function updateDisplaySettingsAction(formData: FormData) {
  const userId = await requireUserId();
  const selected = normalizeSidebarItems(
    formData.getAll("sidebarItems").map(String),
  );
  const wallpaperOpacity = clampSetting(
    Number(formData.get("wallpaperOpacity") ?? 80),
    40,
    100,
  );
  const wallpaperBlur = clampSetting(
    Number(formData.get("wallpaperBlur") ?? 0),
    0,
    20,
  );
  const sidebarAutoHide = formData.get("sidebarAutoHide") === "on";
  const sidebarHideDelay = clampSetting(
    Number(formData.get("sidebarHideDelay") ?? 60),
    15,
    300,
  );

  await prisma.userSettings.upsert({
    where: { userId },
    update: {
      sidebarItems: selected,
      wallpaperOpacity,
      wallpaperBlur,
      sidebarAutoHide,
      sidebarHideDelay,
    },
    create: {
      userId,
      sidebarItems: selected,
      wallpaperOpacity,
      wallpaperBlur,
      sidebarAutoHide,
      sidebarHideDelay,
    },
  });

  revalidatePath("/", "layout");
  redirect("/settings?saved=display");
}

export async function uploadWallpaperAction(formData: FormData) {
  const userId = await requireUserId();
  const file = formData.get("wallpaper");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/settings?error=wallpaper-empty");
  }
  if (file.size > 8 * 1024 * 1024) {
    redirect("/settings?error=wallpaper-size");
  }

  const extension = WALLPAPER_EXTENSIONS[file.type];
  if (!extension) {
    redirect("/settings?error=wallpaper-format");
  }

  const directory = wallpaperDirectory();
  await mkdir(directory, { recursive: true });
  const filename = `${userId}-${randomUUID()}.${extension}`;
  await writeFile(
    path.join(directory, filename),
    Buffer.from(await file.arrayBuffer()),
  );

  const current = await prisma.userSettings.findUnique({
    where: { userId },
    select: { wallpaperUrl: true },
  });
  const previousPath = localWallpaperPath(current?.wallpaperUrl ?? null);

  await prisma.userSettings.upsert({
    where: { userId },
    update: { wallpaperUrl: `/api/wallpaper/${filename}` },
    create: {
      userId,
      wallpaperUrl: `/api/wallpaper/${filename}`,
    },
  });

  if (previousPath) {
    await unlink(previousPath).catch(() => {});
  }

  revalidatePath("/", "layout");
  redirect("/settings?saved=wallpaper");
}

export async function removeWallpaperAction() {
  const userId = await requireUserId();
  const current = await prisma.userSettings.findUnique({
    where: { userId },
    select: { wallpaperUrl: true },
  });
  const previousPath = localWallpaperPath(current?.wallpaperUrl ?? null);

  await prisma.userSettings.updateMany({
    where: { userId },
    data: { wallpaperUrl: null },
  });

  if (previousPath) {
    await unlink(previousPath).catch(() => {});
  }

  revalidatePath("/", "layout");
  redirect("/settings?saved=wallpaper-removed");
}
