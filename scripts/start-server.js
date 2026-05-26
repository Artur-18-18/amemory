/**
 * Production start for Render (Node runtime).
 * Uses .venv (avoids PEP 668 externally-managed-environment on Debian).
 */
const { spawn } = require("child_process");
const path = require("path");
const { ensureVenv } = require("./ensure-venv");

const backend = path.join(__dirname, "..", "backend");
const port = process.env.PORT || "3000";
const python = ensureVenv();

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
