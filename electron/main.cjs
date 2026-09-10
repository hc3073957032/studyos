const { app, BrowserWindow, dialog } = require("electron");
const { spawn, spawnSync } = require("node:child_process");
const crypto = require("node:crypto");
const {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const pg = require("pg");

const WEB_PORT = 3210;
const DB_PORT = 5433;
const appRoot = app.isPackaged
  ? path.join(process.resourcesPath, "app")
  : path.join(__dirname, "..");
const userData = app.getPath("userData");
const binaryDir = path.join(os.homedir(), ".studyos-app-postgres-bin");
const dataDir = path.join(os.homedir(), ".studyos-app-postgres");
const uploadDir = path.join(os.homedir(), ".studyos-app-uploads");
const sourceNative = path.join(
  appRoot,
  "node_modules",
  "@embedded-postgres",
  "windows-x64",
  "native",
);

let mainWindow = null;
let dbProcess = null;
let webProcess = null;
let quitting = false;

function systemTool(name) {
  return path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", name);
}

function killProcessTree(pid) {
  if (!pid) return;
  try {
    spawnSync(systemTool("taskkill.exe"), ["/pid", String(pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } catch {
    // Process already exited.
  }
}

function stopServices() {
  killProcessTree(webProcess?.pid);
  killProcessTree(dbProcess?.pid);
}

function secretValue() {
  const secretPath = path.join(userData, "auth-secret.txt");
  if (existsSync(secretPath)) {
    return readFileSync(secretPath, "utf8").trim();
  }
  const secret = crypto.randomBytes(32).toString("base64");
  writeFileSync(secretPath, secret, "utf8");
  return secret;
}

function prepareDatabaseBinaries() {
  mkdirSync(binaryDir, { recursive: true });
  if (!existsSync(path.join(binaryDir, "bin", "initdb.exe"))) {
    cpSync(sourceNative, binaryDir, { recursive: true });
  }
}

function initialiseDatabase() {
  const postgresEnv = {
    ...process.env,
    LANG: "C",
    LC_ALL: "C",
    LC_MESSAGES: "C",
  };
  const initdb = path.join(binaryDir, "bin", "initdb.exe");
  const postgres = path.join(binaryDir, "bin", "postgres.exe");

  if (!existsSync(path.join(dataDir, "PG_VERSION"))) {
    mkdirSync(dataDir, { recursive: true });
    const passwordFile = path.join(userData, "postgres-password.txt");
    writeFileSync(passwordFile, "password\n", "utf8");
    const result = spawnSync(
      initdb,
      [
        `--pgdata=${dataDir}`,
        "--auth=password",
        "--username=postgres",
        `--pwfile=${passwordFile}`,
        "--no-locale",
        "--encoding=UTF8",
      ],
      { env: postgresEnv, encoding: "utf8" },
    );
    if (result.status !== 0) {
      console.error(result.stdout);
      console.error(result.stderr);
      throw new Error(`PostgreSQL 初始化失败: ${result.stderr || result.stdout}`);
    }
  }

  const pgHba = path.join(dataDir, "pg_hba.conf");
  const hba = readFileSync(pgHba, "utf8");
  if (!hba.includes("studyos desktop trust")) {
    writeFileSync(
      pgHba,
      `# studyos desktop trust\nhost all all 127.0.0.1/32 trust\nhost all all ::1/128 trust\n${hba}`,
      "utf8",
    );
  }

  dbProcess = spawn(
    postgres,
    ["-D", dataDir, "-p", String(DB_PORT), "-h", "127.0.0.1"],
    { env: postgresEnv, stdio: "ignore" },
  );
}

async function waitForDatabase() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const client = new pg.Client({
      host: "127.0.0.1",
      port: DB_PORT,
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
      if (result.rowCount === 0) {
        await client.query("CREATE DATABASE studyos");
      }
      return;
    } catch {
      // Database is still starting.
    } finally {
      await client.end().catch(() => {});
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("PostgreSQL 启动超时");
}

function startWebServer() {
  mkdirSync(uploadDir, { recursive: true });
  const nextBin = path.join(appRoot, "node_modules", "next", "dist", "bin", "next");
  webProcess = spawn(
    process.execPath,
    [nextBin, "start", "-p", String(WEB_PORT)],
    {
      cwd: appRoot,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        NODE_ENV: "production",
        DATABASE_URL: `postgresql://postgres:password@127.0.0.1:${DB_PORT}/studyos?schema=public`,
        AUTH_SECRET: secretValue(),
        AUTH_URL: `http://localhost:${WEB_PORT}`,
        STUDYOS_UPLOAD_DIR: uploadDir,
      },
      stdio: "ignore",
    },
  );
}

function waitForWeb() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts += 1;
      const request = http.get(`http://localhost:${WEB_PORT}/login`, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
        } else if (attempts < 120) {
          setTimeout(check, 500);
        } else {
          reject(new Error("StudyOS 启动超时"));
        }
      });
      request.on("error", () => {
        if (attempts < 120) {
          setTimeout(check, 500);
        } else {
          reject(new Error("StudyOS 启动超时"));
        }
      });
    };
    check();
  });
}

async function boot() {
  console.log("[StudyOS] preparing database binaries");
  prepareDatabaseBinaries();
  console.log("[StudyOS] initialising database");
  initialiseDatabase();
  console.log("[StudyOS] waiting for database");
  await waitForDatabase();
  console.log("[StudyOS] starting web server");
  startWebServer();
  console.log("[StudyOS] waiting for web server");
  await waitForWeb();
  console.log("[StudyOS] boot complete");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: "#f5f5f7",
    show: false,
    title: "StudyOS",
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  });
  mainWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(
      '<body style="margin:0;display:grid;place-items:center;height:100vh;background:#f5f5f7;color:#1d1d1f;font-family:system-ui">StudyOS 正在启动…</body>',
    )}`,
  );
  mainWindow.once("ready-to-show", () => mainWindow.show());
}

const hasLock = app.requestSingleInstanceLock();
if (!hasLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    createWindow();
    try {
      await boot();
      await mainWindow.loadURL(`http://localhost:${WEB_PORT}/dashboard`);
    } catch (error) {
      console.error("[StudyOS] boot failed", error);
      dialog.showErrorBox(
        "StudyOS 启动失败",
        error instanceof Error ? error.message : String(error),
      );
      app.quit();
    }
  });
}

app.on("before-quit", () => {
  if (quitting) return;
  quitting = true;
  stopServices();
});

app.on("window-all-closed", () => app.quit());
