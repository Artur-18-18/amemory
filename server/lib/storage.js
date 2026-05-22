const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const likes = require("./likes");
const {
  UPLOADS_ROOT,
  DATA_DIR,
  SERVER_ROOT,
  ensurePersistentDirs,
  migrateBundledDataToDisk,
} = require("./paths");

const SITE_JSON = path.join(DATA_DIR, "site.json");

const CATEGORIES = ["showcase", "music", "playlist", "memories"];

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const AUDIO_EXT = new Set([
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".aac",
  ".flac",
  ".opus",
  ".weba",
  ".mpeg",
]);

function ensureDirs() {
  ensurePersistentDirs();
  migrateBundledDataToDisk();

  for (const cat of CATEGORIES) {
    const dir = path.join(UPLOADS_ROOT, cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SITE_JSON)) {
    fs.writeFileSync(
      SITE_JSON,
      JSON.stringify({ playlistOrder: [], trackTitles: {}, favorites: [] }, null, 2)
    );
  }
}

function normalizeSiteData(site) {
  if (!site.playlistOrder) site.playlistOrder = [];
  if (!site.trackTitles) site.trackTitles = {};
  if (!site.favorites) site.favorites = [];
  return site;
}

function migrateLegacyUploads() {
  if (!fs.existsSync(UPLOADS_ROOT)) return;
  const showcaseDir = path.join(UPLOADS_ROOT, "showcase");
  if (!fs.existsSync(showcaseDir)) fs.mkdirSync(showcaseDir, { recursive: true });
  const rootFiles = fs.readdirSync(UPLOADS_ROOT).filter((n) => {
    if (n.startsWith(".") || CATEGORIES.includes(n)) return false;
    const full = path.join(UPLOADS_ROOT, n);
    return fs.statSync(full).isFile();
  });
  for (const file of rootFiles) {
    const from = path.join(UPLOADS_ROOT, file);
    const to = path.join(showcaseDir, file);
    if (!fs.existsSync(to)) fs.renameSync(from, to);
  }
}

function readSiteData() {
  try {
    return normalizeSiteData(JSON.parse(fs.readFileSync(SITE_JSON, "utf8")));
  } catch {
    return normalizeSiteData({ playlistOrder: [], trackTitles: {}, favorites: [] });
  }
}

function writeSiteData(data) {
  fs.writeFileSync(SITE_JSON, JSON.stringify(data, null, 2));
}

function detectType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (AUDIO_EXT.has(ext)) return "audio";
  return null;
}

function scanCategory(category) {
  const dir = path.join(UPLOADS_ROOT, category);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => !name.startsWith("."))
    .map((filename) => {
      const type = detectType(filename);
      if (!type) return null;
      const full = path.join(dir, filename);
      const stat = fs.statSync(full);
      const site = readSiteData();
      const title = site.trackTitles?.[`${category}/${filename}`] || filename.replace(/\.[^.]+$/, "");

      return {
        id: `${category}/${filename}`,
        filename,
        category,
        type,
        title,
        url: `/uploads/${category}/${encodeURIComponent(filename)}`,
        mimeType:
          mime.lookup(filename) ||
          (type === "video" ? "video/mp4" : type === "audio" ? "audio/mpeg" : "image/jpeg"),
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
}

function splitShowcaseRows(items) {
  const midpoint = Math.ceil(items.length / 2);
  return {
    top: items.slice(0, midpoint),
    bottom: items.slice(midpoint),
  };
}

function getShowcaseMedia() {
  const items = scanCategory("showcase");
  return { items, rows: splitShowcaseRows(items), total: items.length };
}

function getGalleryImages(sessionId = null) {
  const media = scanCategory("showcase").filter((i) => i.type === "image" || i.type === "video");
  return likes.enrichGalleryItems(media, sessionId);
}

function getMusicTracks() {
  return scanCategory("music");
}

function syncFavoriteToPlaylist(musicFilename) {
  const safe = path.basename(musicFilename);
  const src = path.join(UPLOADS_ROOT, "music", safe);
  const dest = path.join(UPLOADS_ROOT, "playlist", safe);
  if (!fs.existsSync(src)) throw new Error("Трек не найден в разделе «Музыка»");
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
  addToPlaylistOrder(safe);
  return safe;
}

function getFavorites() {
  const site = readSiteData();
  return site.favorites || [];
}

function isFavorite(filename) {
  const safe = path.basename(filename);
  return getFavorites().includes(safe);
}

function addFavorite(musicFilename) {
  const safe = path.basename(musicFilename);
  const site = readSiteData();
  if (!site.favorites.includes(safe)) {
    site.favorites.push(safe);
    syncFavoriteToPlaylist(safe);
    writeSiteData(site);
  }
  return safe;
}

function removeFavorite(musicFilename) {
  const safe = path.basename(musicFilename);
  const site = readSiteData();
  site.favorites = site.favorites.filter((f) => f !== safe);
  site.playlistOrder = (site.playlistOrder || []).filter((f) => f !== safe);

  const dest = path.join(UPLOADS_ROOT, "playlist", safe);
  if (fs.existsSync(dest)) fs.unlinkSync(dest);

  writeSiteData(site);
}

function getPlaylistTracks() {
  const tracks = scanCategory("playlist");
  const site = readSiteData();
  const order = site.playlistOrder || [];
  if (order.length === 0) return tracks;
  const map = new Map(tracks.map((t) => [t.filename, t]));
  const ordered = order.map((f) => map.get(f)).filter(Boolean);
  const rest = tracks.filter((t) => !order.includes(t.filename));
  return [...ordered, ...rest];
}

function getMemoriesMedia() {
  return scanCategory("memories");
}

function getAllAdminFiles() {
  return {
    showcase: scanCategory("showcase"),
    music: scanCategory("music"),
    playlist: scanCategory("playlist"),
    memories: scanCategory("memories"),
  };
}

function deleteFile(category, filename) {
  if (!CATEGORIES.includes(category)) throw new Error("Неверная категория");
  const safe = path.basename(filename);
  const full = path.join(UPLOADS_ROOT, category, safe);
  if (!fs.existsSync(full)) throw new Error("Файл не найден");
  fs.unlinkSync(full);

  if (category === "showcase") {
    likes.removeLikesForFile(safe);
  }

  const site = readSiteData();
  if (site.playlistOrder) {
    site.playlistOrder = site.playlistOrder.filter((f) => f !== safe);
  }
  delete site.trackTitles?.[`${category}/${safe}`];
  if (category === "music" || category === "playlist") {
    site.favorites = (site.favorites || []).filter((f) => f !== safe);
    if (category === "music") {
      const pl = path.join(UPLOADS_ROOT, "playlist", safe);
      if (fs.existsSync(pl)) fs.unlinkSync(pl);
    }
  }
  writeSiteData(site);
}

function setTrackTitle(category, filename, title) {
  const site = readSiteData();
  if (!site.trackTitles) site.trackTitles = {};
  site.trackTitles[`${category}/${filename}`] = title;
  writeSiteData(site);
}

function addToPlaylistOrder(filename) {
  const site = readSiteData();
  if (!site.playlistOrder) site.playlistOrder = [];
  if (!site.playlistOrder.includes(filename)) site.playlistOrder.unshift(filename);
  writeSiteData(site);
}

function categoryDir(category) {
  return path.join(UPLOADS_ROOT, category);
}

module.exports = {
  UPLOADS_ROOT,
  DATA_DIR,
  SERVER_ROOT,
  CATEGORIES,
  ensureDirs,
  migrateLegacyUploads,
  scanCategory,
  getShowcaseMedia,
  getGalleryImages,
  getMusicTracks,
  getPlaylistTracks,
  getMemoriesMedia,
  getAllAdminFiles,
  deleteFile,
  setTrackTitle,
  addToPlaylistOrder,
  categoryDir,
  readSiteData,
  writeSiteData,
  detectType,
  getFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  syncFavoriteToPlaylist,
};
