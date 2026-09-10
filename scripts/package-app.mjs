import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const npmCli = path.join(
  path.dirname(process.execPath),
  "node_modules",
  "npm",
  "bin",
  "npm-cli.js",
);
const builderCli = path.join(
  root,
  "node_modules",
  "electron-builder",
  "out",
  "cli",
  "cli.js",
);

if (!existsSync(builderCli)) {
  throw new Error("electron-builder is not installed");
}

const cacheRoot = path.join(root, ".builder-cache");
const env = {
  ...process.env,
  PATH: `C:\\Windows\\System32;C:\\Windows\\System32\\WindowsPowerShell\\v1.0;C:\\Windows;D:\\node;${process.env.PATH ?? ""}`,
  APPDATA: path.join(root, ".builder-config"),
  LOCALAPPDATA: cacheRoot,
  TEMP: path.join(root, ".tmp"),
  ELECTRON_BUILDER_CACHE: path.join(cacheRoot, "electron-builder"),
  ELECTRON_MIRROR: "https://npmmirror.com/mirrors/electron/",
  ELECTRON_BUILDER_BINARIES_MIRROR:
    "https://npmmirror.com/mirrors/electron-builder-binaries/",
};

async function run(command, args) {
  const child = spawn(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
  });
  const code = await new Promise((resolve) => {
    child.on("exit", (value) => resolve(value));
  });
  if (code !== 0) {
    process.exit(code ?? 1);
  }
}

await run(process.execPath, [npmCli, "run", "build"]);
await run(process.execPath, [builderCli, "--win", "dir"]);
