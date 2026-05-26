/**
 * Production start for Render (Node runtime).
 * Installs Python deps, then runs uvicorn on $PORT.
 */
const { spawn, spawnSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const backend = path.join(root, "backend");
const port = process.env.PORT || "3000";
const python = process.env.PYTHON || "python";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd || root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

console.log("[amemory] Installing Python dependencies…");
run(python, ["-m", "pip", "install", "-r", "backend/requirements.txt", "-q"]);

console.log(`[amemory] Starting API on port ${port}…`);
const child = spawn(
  python,
  ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port],
  {
    cwd: backend,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  }
);

child.on("exit", (code) => process.exit(code ?? 0));
