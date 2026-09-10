import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const npmCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const root = process.cwd();
const env = {
  ...process.env,
  APPDATA: path.join(root, ".next"),
  LOCALAPPDATA: path.join(root, ".next"),
};

const taskkillPath =
  process.platform === "win32"
    ? path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "taskkill.exe")
    : "taskkill";

const dbProcess = spawn(process.execPath, [npmCli, "run", "db:start"], {
  cwd: root,
  env,
  stdio: "inherit",
});

function killProcessTree(pid) {
  if (!pid) return;
  try {
    spawnSync(taskkillPath, ["/pid", String(pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } catch {
    // Process may already be gone.
  }
}

function stop() {
  killProcessTree(dbProcess.pid);
  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

async function waitForDatabase() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const client = new pg.Client({
      host: "127.0.0.1",
      port: Number(process.env.STUDYOS_DB_PORT ?? 5433),
      user: "postgres",
      password: "password",
      database: "postgres",
      connectionTimeoutMillis: 2500,
    });
    try {
      await client.connect();
      const result = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        ["studyos"],
      );
      if (result.rowCount === 1) {
        return;
      }
    } catch {
      // Database is still starting.
    } finally {
      await client.end().catch(() => {});
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  throw new Error("数据库启动超时");
}

async function waitForWeb() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch("http://localhost:3000/login", {
        cache: "no-store",
      });
      if (response.ok) {
        return;
      }
    } catch {
      // Dev server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
}

try {
  await waitForDatabase();
  console.log("数据库已就绪，正在启动 StudyOS…");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  killProcessTree(dbProcess.pid);
  process.exit(1);
}

if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
  const buildProcess = spawn(process.execPath, [npmCli, "run", "build"], {
    cwd: root,
    env,
    stdio: "inherit",
  });
  const buildCode = await new Promise((resolve) => {
    buildProcess.on("exit", (code) => resolve(code));
  });
  if (buildCode !== 0) {
    killProcessTree(dbProcess.pid);
    process.exit(buildCode ?? 1);
  }
}

const devProcess = spawn(process.execPath, [npmCli, "run", "start"], {
  cwd: root,
  env,
  stdio: "inherit",
});

devProcess.on("exit", (code) => {
  killProcessTree(dbProcess.pid);
  process.exit(code ?? 0);
});

await waitForWeb();

if (process.platform === "win32") {
  const comspec = process.env.ComSpec ?? "C:\\Windows\\System32\\cmd.exe";
  const opener = spawn(comspec, ["/c", "start", "", "http://localhost:3000/login"], {
    detached: true,
    stdio: "ignore",
  });
  opener.on("error", () => {
    console.log("StudyOS 已启动：http://localhost:3000/login");
  });
  opener.unref();
} else {
  console.log("StudyOS 已启动：http://localhost:3000/login");
}