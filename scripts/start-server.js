/**
 * Production start for Render — без pip install (только venv из build).
 */
const { spawn } = require("child_process");
const path = require("path");
const { getVenvPython } = require("./ensure-venv");

const backend = path.join(__dirname, "..", "backend");
const port = process.env.PORT || "3000";
const python = getVenvPython();

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
