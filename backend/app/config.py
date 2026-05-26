import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]  # корень репозитория Amemory
CLIENT_DIST = ROOT_DIR / "client" / "dist"
LEGACY_UPLOADS = ROOT_DIR / "server" / "uploads"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{ROOT_DIR / 'amemory.db'}",
)

# Render даёт postgres:// — SQLAlchemy 2 хочет postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

MEMORIES_PASSWORD = os.getenv("MEMORIES_PASSWORD", "arturzarina1818_")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "arturzarina1818_")

CATEGORIES = ("showcase", "music", "playlist", "memories")

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
VIDEO_EXT = {".mp4", ".webm", ".mov", ".m4v"}
AUDIO_EXT = {".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".opus", ".weba", ".mpeg"}
