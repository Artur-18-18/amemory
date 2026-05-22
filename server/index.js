const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
  authMiddleware,
  checkAdminPassword,
  checkMemoriesPassword,
  createToken,
} = require("./lib/auth");
const storage = require("./lib/storage");
const visits = require("./lib/visits");
const likes = require("./lib/likes");
const journal = require("./lib/journal");

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist");

storage.ensureDirs();
storage.migrateLegacyUploads();

if (process.env.PERSISTENT_PATH) {
  console.log(`Persistent storage: ${process.env.PERSISTENT_PATH}`);
} else {
  console.log("Storage: local server/ folder (dev mode)");
}

function getUploadCategory(req) {
  return req.query.category || req.body?.category || "showcase";
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, _file, cb) {
      const category = getUploadCategory(req);
      if (!storage.CATEGORIES.includes(category)) {
        return cb(new Error("Неверная категория"));
      }
      cb(null, storage.categoryDir(category));
    },
    filename(_req, file, cb) {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._\-\u0400-\u04FF ]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "amemory",
    persistent: Boolean(process.env.PERSISTENT_PATH),
    storagePath: process.env.PERSISTENT_PATH || "server/",
  });
});

app.post("/api/visit", (req, res) => {
  const visit = visits.recordVisit(req, req.body || {});
  res.json({ ok: true, id: visit.id });
});

app.get("/api/admin/visits", authMiddleware("admin"), (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  res.json({
    visits: visits.getVisitHistory(limit),
    stats: visits.getVisitStats(),
  });
});

app.delete("/api/admin/visits", authMiddleware("admin"), (_req, res) => {
  visits.clearVisits();
  res.json({ ok: true });
});

app.get("/api/media", (_req, res) => {
  res.json(storage.getShowcaseMedia());
});

app.get("/api/journal", (_req, res) => {
  const entries = journal.getJournalEntries();
  res.json({ entries, total: entries.length });
});

app.get("/api/admin/journal", authMiddleware("admin"), (_req, res) => {
  const entries = journal.getJournalEntries();
  res.json({ entries, total: entries.length });
});

app.post("/api/admin/journal", authMiddleware("admin"), (req, res) => {
  try {
    const entry = journal.createEntry(req.body || {});
    res.json({ ok: true, entry });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/admin/journal/:id", authMiddleware("admin"), (req, res) => {
  try {
    const entry = journal.updateEntry(req.params.id, req.body || {});
    res.json({ ok: true, entry });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/admin/journal/:id", authMiddleware("admin"), (req, res) => {
  try {
    journal.deleteEntry(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/gallery", (req, res) => {
  const sessionId = req.query.sessionId || req.headers["x-session-id"] || null;
  const items = storage.getGalleryImages(sessionId);
  res.json({ items, total: items.length });
});

app.post("/api/likes/toggle", (req, res) => {
  const { filename, sessionId } = req.body || {};
  if (!filename) return res.status(400).json({ error: "Укажите файл" });
  if (!sessionId) return res.status(400).json({ error: "Укажите sessionId" });
  try {
    const result = likes.toggleLike(filename, sessionId);
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/music", (_req, res) => {
  const items = storage.getMusicTracks();
  res.json({ items, total: items.length, favorites: storage.getFavorites() });
});

app.get("/api/playlist", (_req, res) => {
  const items = storage.getPlaylistTracks();
  res.json({ items, total: items.length, favorites: storage.getFavorites() });
});

app.get("/api/favorites", (_req, res) => {
  res.json({ favorites: storage.getFavorites() });
});

app.post("/api/favorites", (req, res) => {
  const { filename } = req.body || {};
  if (!filename) return res.status(400).json({ error: "Укажите файл трека" });
  try {
    storage.addFavorite(filename);
    res.json({
      ok: true,
      favorites: storage.getFavorites(),
      playlist: storage.getPlaylistTracks(),
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/favorites/:filename", (req, res) => {
  try {
    storage.removeFavorite(req.params.filename);
    res.json({ ok: true, favorites: storage.getFavorites() });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/auth/memories", (req, res) => {
  const { password } = req.body || {};
  if (!checkMemoriesPassword(password)) {
    return res.status(403).json({ error: "Неверный пароль" });
  }
  res.json({ token: createToken("memories", 8), message: "Доступ открыт" });
});

app.post("/api/auth/admin", (req, res) => {
  const { password } = req.body || {};
  if (!checkAdminPassword(password)) {
    return res.status(403).json({ error: "Неверный пароль" });
  }
  res.json({ token: createToken("admin", 12), message: "Вход выполнен" });
});

app.get("/api/memories", authMiddleware("memories"), (_req, res) => {
  const items = storage.getMemoriesMedia();
  res.json({ items, total: items.length });
});

app.get("/api/admin/files", authMiddleware("admin"), (_req, res) => {
  const files = storage.getAllAdminFiles();
  const likeCounts = likes.getAllLikeCounts();
  files.showcase = files.showcase.map((item) => ({
    ...item,
    likes:
      item.type === "image" || item.type === "video"
        ? likeCounts[item.filename] || 0
        : null,
  }));
  res.json(files);
});

app.post("/api/admin/upload", authMiddleware("admin"), upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не передан" });
  }
  const category = getUploadCategory(req);
  if (!storage.CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Неверная категория" });
  }

  const ext = path.extname(req.file.filename).toLowerCase();
  if ((category === "music" || category === "playlist") && !storage.detectType(req.file.filename)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      error: "Неподдерживаемый аудиоформат. Используйте MP3, WAV, OGG, M4A, FLAC",
    });
  }

  const title = req.body?.title?.trim();
  if (title) storage.setTrackTitle(category, req.file.filename, title);
  if (category === "playlist") storage.addToPlaylistOrder(req.file.filename);

  const items = storage.scanCategory(category);
  const uploaded = items.find((i) => i.filename === req.file.filename);
  res.json({ ok: true, file: uploaded, category });
});

app.delete("/api/admin/files/:category/:filename", authMiddleware("admin"), (req, res) => {
  try {
    storage.deleteFile(req.params.category, req.params.filename);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.patch("/api/admin/files/:category/:filename", authMiddleware("admin"), (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ error: "Укажите название" });
  storage.setTrackTitle(req.params.category, req.params.filename, title);
  res.json({ ok: true });
});

app.use(
  "/uploads",
  express.static(storage.UPLOADS_ROOT, {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
    etag: true,
  })
);

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { maxAge: "1d", etag: true }));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message || "Ошибка сервера" });
});

app.listen(PORT, () => {
  console.log(`Amemory server: http://localhost:${PORT}`);
});
