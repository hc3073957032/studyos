import { describe, expect, it } from "vitest";

import {
  clampSetting,
  normalizeSidebarItems,
  WALLPAPER_EXTENSIONS,
} from "@/lib/settings";

describe("normalizeSidebarItems", () => {
  it("keeps valid items and always keeps settings", () => {
    expect(normalizeSidebarItems(["tasks", "invalid", "settings"])).toEqual([
      "tasks",
      "settings",
    ]);
    expect(normalizeSidebarItems(["knowledge"])).toEqual([
      "knowledge",
      "settings",
    ]);
  });
});

describe("clampSetting", () => {
  it("keeps display values inside the supported range", () => {
    expect(clampSetting(20, 40, 100)).toBe(40);
    expect(clampSetting(120, 40, 100)).toBe(100);
    expect(clampSetting(72.6, 40, 100)).toBe(73);
  });
});

describe("WALLPAPER_EXTENSIONS", () => {
  it("accepts common browser image formats", () => {
    expect(WALLPAPER_EXTENSIONS["image/png"]).toBe("png");
    expect(WALLPAPER_EXTENSIONS["image/webp"]).toBe("webp");
  });
});
