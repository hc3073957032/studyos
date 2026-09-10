export const SIDEBAR_ITEM_IDS = [
  "dashboard",
  "goals",
  "courses",
  "tasks",
  "focus",
  "reviews",
  "semesters",
  "plans",
  "materials",
  "knowledge",
  "notes",
  "analytics",
  "settings",
] as const;

export const WALLPAPER_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function normalizeSidebarItems(items: string[]): string[] {
  const allowed = new Set<string>(SIDEBAR_ITEM_IDS);
  const normalized = items.filter((item) => allowed.has(item));
  if (!normalized.includes("settings")) {
    normalized.push("settings");
  }
  return normalized;
}

export function clampSetting(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}
