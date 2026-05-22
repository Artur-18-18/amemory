const fs = require("fs");
const path = require("path");

const LIKES_FILE = path.join(__dirname, "..", "data", "likes.json");

function ensureFile() {
  const dir = path.dirname(LIKES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LIKES_FILE)) {
    fs.writeFileSync(LIKES_FILE, JSON.stringify({ counts: {}, sessions: {} }, null, 2));
  }
}

function readLikes() {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(LIKES_FILE, "utf8"));
    if (!data.counts) data.counts = {};
    if (!data.sessions) data.sessions = {};
    return data;
  } catch {
    return { counts: {}, sessions: {} };
  }
}

function writeLikes(data) {
  ensureFile();
  fs.writeFileSync(LIKES_FILE, JSON.stringify(data, null, 2));
}

function getLikeCount(filename) {
  const safe = path.basename(filename);
  const data = readLikes();
  return data.counts[safe] || 0;
}

function getAllLikeCounts() {
  return readLikes().counts;
}

function hasLiked(filename, sessionId) {
  if (!sessionId) return false;
  const safe = path.basename(filename);
  const sessions = readLikes().sessions[safe] || [];
  return sessions.includes(sessionId);
}

function toggleLike(filename, sessionId) {
  if (!sessionId) throw new Error("Требуется идентификатор сессии");

  const safe = path.basename(filename);
  const data = readLikes();
  if (!data.sessions[safe]) data.sessions[safe] = [];
  if (!data.counts[safe]) data.counts[safe] = 0;

  const idx = data.sessions[safe].indexOf(sessionId);
  let liked;

  if (idx >= 0) {
    data.sessions[safe].splice(idx, 1);
    data.counts[safe] = Math.max(0, data.counts[safe] - 1);
    liked = false;
  } else {
    data.sessions[safe].push(sessionId);
    data.counts[safe] += 1;
    liked = true;
  }

  writeLikes(data);
  return { liked, likes: data.counts[safe] };
}

function removeLikesForFile(filename) {
  const safe = path.basename(filename);
  const data = readLikes();
  delete data.counts[safe];
  delete data.sessions[safe];
  writeLikes(data);
}

function enrichGalleryItems(items, sessionId) {
  const counts = readLikes().counts;
  return items.map((item) => ({
    ...item,
    likes: counts[item.filename] || 0,
    liked: hasLiked(item.filename, sessionId),
  }));
}

module.exports = {
  getLikeCount,
  getAllLikeCounts,
  toggleLike,
  removeLikesForFile,
  enrichGalleryItems,
  hasLiked,
};
