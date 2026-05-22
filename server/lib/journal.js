const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { DATA_DIR } = require("./paths");
const SITE_JSON = path.join(DATA_DIR, "site.json");

const DEFAULT_ENTRIES = [
  {
    date: "Май 2026",
    title: "Тихая скорость",
    excerpt:
      "Между огнями города и прибрежной тишиной — исследование контраста на плёнке и в цифровом кино.",
  },
  {
    date: "Апрель 2026",
    title: "Часы matte black",
    excerpt:
      "Часы до рассвета несут другую тяжесть. Заметки о ремесле, сдержанности и роскоши медленности.",
  },
  {
    date: "Март 2026",
    title: "Фиолетовый час, Женева",
    excerpt:
      "Дневник выходных у озера — архитектура, крой и звук дождя по стеклу.",
  },
];

function readSite() {
  try {
    return JSON.parse(fs.readFileSync(SITE_JSON, "utf8"));
  } catch {
    return {};
  }
}

function writeSite(site) {
  const dir = path.dirname(SITE_JSON);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SITE_JSON, JSON.stringify(site, null, 2));
}

function seedIfEmpty(site) {
  if (!site.journal || site.journal.length === 0) {
    site.journal = DEFAULT_ENTRIES.map((e, i) => ({
      id: crypto.randomBytes(6).toString("hex"),
      date: e.date,
      title: e.title,
      excerpt: e.excerpt,
      order: i,
    }));
    writeSite(site);
  }
  return site;
}

function getJournalEntries() {
  const site = seedIfEmpty(readSite());
  const entries = site.journal || [];
  return [...entries].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function createEntry({ date, title, excerpt }) {
  if (!date?.trim() || !title?.trim()) {
    throw new Error("Укажите дату и заголовок");
  }
  const site = seedIfEmpty(readSite());
  const entry = {
    id: crypto.randomBytes(6).toString("hex"),
    date: date.trim(),
    title: title.trim(),
    excerpt: (excerpt || "").trim(),
    order: site.journal.length,
  };
  site.journal.push(entry);
  writeSite(site);
  return entry;
}

function updateEntry(id, { date, title, excerpt }) {
  const site = seedIfEmpty(readSite());
  const idx = site.journal.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error("Запись не найдена");

  if (date !== undefined) site.journal[idx].date = date.trim();
  if (title !== undefined) site.journal[idx].title = title.trim();
  if (excerpt !== undefined) site.journal[idx].excerpt = excerpt.trim();

  writeSite(site);
  return site.journal[idx];
}

function deleteEntry(id) {
  const site = seedIfEmpty(readSite());
  const before = site.journal.length;
  site.journal = site.journal.filter((e) => e.id !== id);
  if (site.journal.length === before) throw new Error("Запись не найдена");
  site.journal.forEach((e, i) => {
    e.order = i;
  });
  writeSite(site);
}

module.exports = {
  getJournalEntries,
  createEntry,
  updateEntry,
  deleteEntry,
};
