/**
 * Create .venv and install backend/requirements.txt (PEP 668 safe on Render/Debian).
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const venvDir = path.join(root, ".venv");
const isWin = process.platform === "win32";
const venvPython = path.join(venvDir, isWin ? "Scripts" : "bin", isWin ? "python.exe" : "python");
const basePython = process.env.PYTHON || (isWin ? "python" : "python3");

function run(cmd, args, cwd = root) {
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: isWin,
    env: process.env,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function ensureVenv() {
  if (!fs.existsSync(venvPython)) {
    console.log("[amemory] Creating Python venv…");
    run(basePython, ["-m", "venv", venvDir]);
  }

  console.log("[amemory] Installing Python dependencies in venv…");
  run(venvPython, ["-m", "pip", "install", "--upgrade", "pip", "-q"]);
  run(venvPython, ["-m", "pip", "install", "-r", "backend/requirements.txt", "-q"]);

  return venvPython;
}

module.exports = { ensureVenv, venvPython: () => venvPython };

if (require.main === module) {
  ensureVenv();
}
