const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { DATA_DIR } = require("./paths");
const VISITS_FILE = path.join(DATA_DIR, "visits.json");
const MAX_VISITS = 500;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(VISITS_FILE)) {
    fs.writeFileSync(VISITS_FILE, JSON.stringify({ visits: [] }, null, 2));
  }
}

function readVisits() {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(VISITS_FILE, "utf8"));
    return Array.isArray(data.visits) ? data.visits : [];
  } catch {
    return [];
  }
}

function writeVisits(visits) {
  ensureFile();
  fs.writeFileSync(VISITS_FILE, JSON.stringify({ visits }, null, 2));
}

function parseUserAgent(ua = "") {
  const s = ua.toLowerCase();
  let os = "Неизвестно";
  if (s.includes("windows")) os = "Windows";
  else if (s.includes("iphone") || s.includes("ipad")) os = "iOS";
  else if (s.includes("android")) os = "Android";
  else if (s.includes("mac os") || s.includes("macintosh")) os = "macOS";
  else if (s.includes("linux")) os = "Linux";

  let browser = "Неизвестно";
  if (s.includes("edg/")) browser = "Edge";
  else if (s.includes("chrome/") && !s.includes("chromium")) browser = "Chrome";
  else if (s.includes("firefox/")) browser = "Firefox";
  else if (s.includes("safari/") && !s.includes("chrome")) browser = "Safari";
  else if (s.includes("opera") || s.includes("opr/")) browser = "Opera";

  let deviceType = "Компьютер";
  if (s.includes("mobile") || s.includes("iphone") || (s.includes("android") && !s.includes("tablet"))) {
    deviceType = "Телефон";
  } else if (s.includes("ipad") || s.includes("tablet")) {
    deviceType = "Планшет";
  }

  return { os, browser, deviceType };
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "—";
}

function recordVisit(req, body = {}) {
  const ua = req.headers["user-agent"] || body.userAgent || "";
  const parsed = parseUserAgent(ua);

  let deviceType = body.deviceType || parsed.deviceType;
  if (body.screenWidth && body.screenWidth < 768) deviceType = "Телефон";
  else if (body.screenWidth && body.screenWidth < 1024 && deviceType === "Компьютер") {
    deviceType = "Планшет";
  }

  const visit = {
    id: crypto.randomBytes(8).toString("hex"),
    at: new Date().toISOString(),
    ip: getClientIp(req),
    path: body.path || "/",
    sessionId: body.sessionId || null,
    language: body.language || req.headers["accept-language"]?.split(",")[0] || "—",
    referrer: body.referrer || req.headers.referer || "—",
    screen: {
      width: body.screenWidth || null,
      height: body.screenHeight || null,
    },
    device: {
      type: deviceType,
      os: parsed.os,
      browser: parsed.browser,
    },
    userAgent: ua.slice(0, 300),
  };

  const visits = readVisits();
  visits.unshift(visit);
  writeVisits(visits.slice(0, MAX_VISITS));
  return visit;
}

function getVisitHistory(limit = 100) {
  return readVisits().slice(0, limit);
}

function clearVisits() {
  writeVisits([]);
}

function getVisitStats() {
  const visits = readVisits();
  const uniqueSessions = new Set(visits.map((v) => v.sessionId).filter(Boolean)).size;
  const byDevice = {};
  for (const v of visits) {
    const key = `${v.device.type} · ${v.device.os}`;
    byDevice[key] = (byDevice[key] || 0) + 1;
  }
  return {
    total: visits.length,
    uniqueSessions,
    byDevice: Object.entries(byDevice)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}

module.exports = {
  recordVisit,
  getVisitHistory,
  getVisitStats,
  clearVisits,
};
