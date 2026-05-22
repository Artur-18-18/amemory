const crypto = require("crypto");

const sessions = new Map();

const MEMORIES_PASSWORD = process.env.MEMORIES_PASSWORD || "arturzarina1818_";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "arturzarina1818_";

function createToken(type, hours = 12) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { type, exp: Date.now() + hours * 60 * 60 * 1000 });
  return token;
}

function verifyToken(token, type) {
  if (!token) return false;
  const session = sessions.get(token);
  if (!session || session.type !== type || Date.now() > session.exp) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function authMiddleware(type) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.query.token;
    if (!verifyToken(token, type)) {
      return res.status(401).json({ error: "Требуется авторизация" });
    }
    next();
  };
}

function checkMemoriesPassword(password) {
  return password === MEMORIES_PASSWORD;
}

function checkAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

module.exports = {
  createToken,
  verifyToken,
  authMiddleware,
  checkMemoriesPassword,
  checkAdminPassword,
};
