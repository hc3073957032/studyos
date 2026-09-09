import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import pg from "pg";

const home = os.homedir();
const dataDir = process.env.STUDYOS_DB_DIR ?? path.join(home, ".studyos-postgres");
const binaryDir = path.join(home, ".studyos-postgres-bin");
const sourceNative = path.resolve("node_modules/@embedded-postgres/windows-x64/native");
const port = Number(process.env.STUDYOS_DB_PORT ?? 5433);
const user = "postgres";
const password = "password";

mkdirSync(dataDir, { recursive: true });

const stampFile = path.join(binaryDir, ".studyos-copy-stamp");
const sourceStamp = String(statSync(sourceNative).mtimeMs);
if (!existsSync(path.join(binaryDir, "bin", "initdb.exe")) || readFileSync(stampFile, "utf8") !== sourceStamp) {
  cpSync(sourceNative, binaryDir, { recursive: true, force: true });
  writeFileSync(stampFile, sourceStamp, "utf8");
}

const initdb = path.join(binaryDir, "bin", "initdb.exe");
const postgres = path.join(binaryDir, "bin", "postgres.exe");
const pgHba = path.join(dataDir, "pg_hba.conf");
const dbEnv = {
  ...process.env,
  LANG: "C",
  LC_ALL: "C",
  LC_MESSAGES: "C",
};

if (!existsSync(path.join(dataDir, "PG_VERSION"))) {
  const passwordFile = path.join(os.tmpdir(), `studyos-pg-password-${Date.now()}`);
  writeFileSync(passwordFile, `${password}\n`, "utf8");
  const result = spawnSync(
    initdb,
    [
      `--pgdata=${dataDir}`,
      `--auth=password`,
      `--username=${user}`,
      `--pwfile=${passwordFile}`,
      "--no-locale",
      "--encoding=UTF8",
    ],
    { env: dbEnv, stdio: "inherit" },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(pgHba)) {
  throw new Error("pg_hba.conf is missing after initdb");
}

const hba = readFileSync(pgHba, "utf8");
if (!hba.includes("studyos local development trust")) {
  writeFileSync(
    pgHba,
    `# studyos local development trust\nhost all all 127.0.0.1/32 trust\nhost all all ::1/128 trust\n${hba}`,
    "utf8",
  );
}

const server = spawn(
  postgres,
  ["-D", dataDir, "-p", String(port), "-h", "127.0.0.1"],
  { env: dbEnv, stdio: ["ignore", "pipe", "pipe"] },
);

server.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

async function waitForReady() {
  let lastError;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const client = new pg.Client({
      host: "127.0.0.1",
      port,
      user,
      password,
      database: "postgres",
    });
    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`PostgreSQL did not become ready: ${lastError?.message ?? "unknown error"}`);
}

const adminClient = await waitForReady();
try {
  const result = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    ["studyos"],
  );
  if (result.rowCount === 0) {
    await adminClient.query("CREATE DATABASE studyos");
  }
} finally {
  await adminClient.end();
}

console.log(`PostgreSQL ready on 127.0.0.1:${port} (studyos)`);

function shutdown() {
  server.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);