"""Импорт файлов и метаданных из старого Node-сервера при первом запуске."""

import json
from pathlib import Path

from sqlalchemy.orm import Session

from ..config import CATEGORIES, LEGACY_UPLOADS, ROOT_DIR
from ..models import JournalEntry, Like, MediaFile
from .media import create_media, detect_media_type, get_file

DATA_DIR = ROOT_DIR / "server" / "data"
SITE_JSON = DATA_DIR / "site.json"
LIKES_JSON = DATA_DIR / "likes.json"


def import_legacy_uploads(db: Session) -> int:
    if not LEGACY_UPLOADS.exists():
        return 0

    imported = 0
    for category in CATEGORIES:
        folder = LEGACY_UPLOADS / category
        if not folder.is_dir():
            continue
        for path in folder.iterdir():
            if not path.is_file() or path.name.startswith("."):
                continue
            if not detect_media_type(path.name):
                continue
            if get_file(db, category, path.name):
                continue
            content = path.read_bytes()
            create_media(db, category, path.name, content, path.stem)
            imported += 1

    # Файлы в корне uploads (старый формат)
    for path in LEGACY_UPLOADS.iterdir():
        if not path.is_file() or path.name.startswith("."):
            continue
        if not detect_media_type(path.name):
            continue
        if get_file(db, "showcase", path.name):
            continue
        create_media(db, "showcase", path.name, path.read_bytes(), path.stem)
        imported += 1

    imported += _import_site_metadata(db)
    return imported


def _import_site_metadata(db: Session) -> int:
    changed = 0
    if SITE_JSON.exists():
        try:
            site = json.loads(SITE_JSON.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            site = {}

        if db.query(JournalEntry).count() == 0 and site.get("journal"):
            for entry in site["journal"]:
                db.add(
                    JournalEntry(
                        id=entry.get("id") or entry["title"][:8],
                        date=entry.get("date", ""),
                        title=entry.get("title", ""),
                        excerpt=entry.get("excerpt", ""),
                        sort_order=entry.get("order", 0),
                    )
                )
            db.commit()
            changed += 1

        for key, title in (site.get("trackTitles") or {}).items():
            parts = key.split("/", 1)
            if len(parts) != 2:
                continue
            category, filename = parts
            item = get_file(db, category, filename)
            if item and title:
                item.title = title
                changed += 1
        if changed:
            db.commit()

        for fav in site.get("favorites") or []:
            name = fav.split("/")[-1] if "/" in fav else fav
            music = get_file(db, "music", name)
            if not music:
                continue
            from .media import add_favorite

            try:
                add_favorite(db, name)
                changed += 1
            except ValueError:
                pass

    if LIKES_JSON.exists():
        try:
            likes_data = json.loads(LIKES_JSON.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            likes_data = {}
        for filename, sessions in (likes_data.get("sessions") or {}).items():
            media = (
                db.query(MediaFile)
                .filter(MediaFile.category == "showcase", MediaFile.filename == filename)
                .first()
            )
            if not media:
                continue
            for session_id in sessions:
                exists = (
                    db.query(Like)
                    .filter(Like.media_id == media.id, Like.session_id == session_id)
                    .first()
                )
                if not exists:
                    db.add(Like(media_id=media.id, session_id=session_id))
                    changed += 1
        if changed:
            db.commit()

    return changed
