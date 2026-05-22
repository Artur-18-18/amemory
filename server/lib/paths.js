const fs = require("fs");
const path = require("path");

const SERVER_ROOT = path.join(__dirname, "..");

/** На Render: диск монтируется сюда (см. PERSISTENT_PATH) */
const PERSISTENT_ROOT = process.env.PERSISTENT_PATH
  ? path.resolve(process.env.PERSISTENT_PATH)
  : SERVER_ROOT;

const UPLOADS_ROOT = path.join(PERSISTENT_ROOT, "uploads");
const DATA_DIR = path.join(PERSISTENT_ROOT, "data");

function ensurePersistentDirs() {
  for (const dir of [UPLOADS_ROOT, DATA_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

/** Первый запуск с диском: копируем локальные uploads/data из образа, если диск пустой */
function migrateBundledDataToDisk() {
  if (!process.env.PERSISTENT_PATH) return;

  const bundledUploads = path.join(SERVER_ROOT, "uploads");
  const bundledData = path.join(SERVER_ROOT, "data");

  copyDirIfTargetEmpty(bundledUploads, UPLOADS_ROOT);
  copyDirIfTargetEmpty(bundledData, DATA_DIR);
}

function copyDirIfTargetEmpty(src, dest) {
  if (!fs.existsSync(src)) return;

  const destHasFiles = fs.existsSync(dest) && fs.readdirSync(dest).some((n) => !n.startsWith("."));
  if (destHasFiles) return;

  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  copyRecursive(src, dest);
}

function copyRecursive(src, dest) {
  for (const name of fs.readdirSync(src)) {
    if (name.startsWith(".")) continue;
    const from = path.join(src, name);
    const to = path.join(dest, name);
    const stat = fs.statSync(from);
    if (stat.isDirectory()) {
      if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
      copyRecursive(from, to);
    } else if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to);
    }
  }
}

module.exports = {
  SERVER_ROOT,
  PERSISTENT_ROOT,
  UPLOADS_ROOT,
  DATA_DIR,
  ensurePersistentDirs,
  migrateBundledDataToDisk,
  isPersistentDisk: Boolean(process.env.PERSISTENT_PATH),
};
