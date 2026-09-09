import { spawn } from "node:child_process";
import path from "node:path";
import pg from "pg";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const root = process.cwd();
const env = {
  ...process.env,
  APPDATA: path.join(root, ".next"),
  LOCALAPPDATA: path.join(root, ".next"),
};

const dbProcess = spawn(npmCommand, ["run", "db:start"], {
  cwd: root,
  env,
  stdio: "inherit",
});

async function waitForDatabase() {
  const client = new pg.Client({
    host: "127.0.0.1",
    port: Number(process.env.STUDYOS_DB_PORT ?? 5433),
    user: "postgres",
    password: "password",
    database: "postgres",
  });
  try {
    for (let attempt = 0; attempt < 60; attempt += 1) {
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
      }
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    throw new Error("数据库启动超时");
  } finally {
    await client.end().catch(() => {});
  }
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

function stop() {
  dbProcess.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

try {
  await waitForDatabase();
  console.log("数据库已就绪，正在启动 StudyOS…");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  dbProcess.kill("SIGTERM");
  process.exit(1);
}

const devProcess = spawn(npmCommand, ["run", "dev"], {
  cwd: root,
  env,
  stdio: "inherit",
});

devProcess.on("exit", (code) => {
  dbProcess.kill("SIGTERM");
  process.exit(code ?? 0);
});

await waitForWeb();

if (process.platform === "win32") {
  spawn("cmd", ["/c", "start", "http://localhost:3000/login"], {
    detached: true,
    stdio: "ignore",
  }).unref();
} else {
  console.log("打开 http://localhost:3000/login");
}
