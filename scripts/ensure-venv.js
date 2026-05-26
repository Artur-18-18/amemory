/**
 * Python venv: полная установка на build, быстрый старт на run.
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

/** Только для npm run render:build */
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

/** Быстрый старт — без pip (Render health check) */
function getVenvPython() {
  if (!fs.existsSync(venvPython)) {
    console.error(
      "[amemory] .venv not found. Set Build Command: npm install && npm run render:build"
    );
    process.exit(1);
  }
  return venvPython;
}

module.exports = { ensureVenv, getVenvPython };

if (require.main === module) {
  ensureVenv();
}
