import mimetypes
import re
import secrets
from datetime import datetime
from urllib.parse import quote

from sqlalchemy import func
from sqlalchemy.orm import Session, defer

from ..config import AUDIO_EXT, CATEGORIES, IMAGE_EXT, VIDEO_EXT
from ..models import Favorite, Like, MediaFile


def detect_media_type(filename: str) -> str | None:
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in IMAGE_EXT:
        return "image"
    if ext in VIDEO_EXT:
        return "video"
    if ext in AUDIO_EXT:
        return "audio"
    return None


def safe_filename(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._\-\u0400-\u04FF ]", "_", name)


def media_to_dict(
    item: MediaFile,
    *,
    likes: int = 0,
    liked: bool = False,
) -> dict:
    return {
        "id": f"{item.category}/{item.filename}",
        "filename": item.filename,
        "category": item.category,
        "type": item.media_type,
        "title": item.title or item.filename.rsplit(".", 1)[0],
        "url": f"/uploads/{item.category}/{quote(item.filename)}",
        "mimeType": item.mime_type,
        "size": item.size,
        "modifiedAt": item.created_at.isoformat() + "Z",
        "likes": likes,
        "liked": liked,
    }


def like_count(db: Session, media_id: int) -> int:
    return db.query(func.count(Like.id)).filter(Like.media_id == media_id).scalar() or 0


def is_liked(db: Session, media_id: int, session_id: str | None) -> bool:
    if not session_id:
        return False
    return (
        db.query(Like)
        .filter(Like.media_id == media_id, Like.session_id == session_id)
        .first()
        is not None
    )


def enrich_items(db: Session, items: list[MediaFile], session_id: str | None = None) -> list[dict]:
    if not items:
        return []

    ids = [item.id for item in items]
    counts = {
        mid: cnt
        for mid, cnt in db.query(Like.media_id, func.count(Like.id))
        .filter(Like.media_id.in_(ids))
        .group_by(Like.media_id)
        .all()
    }
    liked_ids: set[int] = set()
    if session_id:
        liked_ids = {
            mid
            for (mid,) in db.query(Like.media_id)
            .filter(Like.media_id.in_(ids), Like.session_id == session_id)
            .all()
        }

    return [
        media_to_dict(
            item,
            likes=counts.get(item.id, 0),
            liked=item.id in liked_ids,
        )
        for item in items
    ]


def _query_meta(db: Session):
    """Список/метаданные без загрузки бинарника (иначе OOM на Render)."""
    return db.query(MediaFile).options(defer(MediaFile.content))


def list_by_category(db: Session, category: str) -> list[MediaFile]:
    q = _query_meta(db).filter(MediaFile.category == category)
    if category == "playlist":
        return q.order_by(
            MediaFile.playlist_order.asc().nulls_last(),
            MediaFile.created_at.desc(),
        ).all()
    return q.order_by(MediaFile.created_at.desc()).all()


def get_file(db: Session, category: str, filename: str) -> MediaFile | None:
    return (
        _query_meta(db)
        .filter(MediaFile.category == category, MediaFile.filename == filename)
        .first()
    )


def get_file_with_content(
    db: Session, category: str, filename: str
) -> MediaFile | None:
    return (
        db.query(MediaFile)
        .filter(MediaFile.category == category, MediaFile.filename == filename)
        .first()
    )


def create_media(
    db: Session,
    category: str,
    filename: str,
    content: bytes,
    title: str | None = None,
) -> MediaFile:
    if category not in CATEGORIES:
        raise ValueError("Неверная категория")
    media_type = detect_media_type(filename)
    if not media_type:
        raise ValueError("Неподдерживаемый формат файла")
    if category in ("music", "playlist") and media_type != "audio":
        raise ValueError("Неподдерживаемый аудиоформат. Используйте MP3, WAV, OGG, M4A, FLAC")

    mime = mimetypes.guess_type(filename)[0] or (
        "video/mp4" if media_type == "video" else "audio/mpeg" if media_type == "audio" else "image/jpeg"
    )

    existing = get_file_with_content(db, category, filename)
    if existing:
        db.delete(existing)
        db.flush()

    item = MediaFile(
        category=category,
        filename=filename,
        title=(title or "").strip() or filename.rsplit(".", 1)[0],
        mime_type=mime,
        media_type=media_type,
        size=len(content),
        content=content,
        playlist_order=0 if category == "playlist" else None,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete_media(db: Session, category: str, filename: str) -> None:
    item = get_file(db, category, filename)
    if not item:
        raise ValueError("Файл не найден")
    db.query(Favorite).filter(Favorite.music_media_id == item.id).delete()
    db.delete(item)
    db.commit()


def rename_media(db: Session, category: str, filename: str, title: str) -> None:
    item = get_file(db, category, filename)
    if not item:
        raise ValueError("Файл не найден")
    item.title = title.strip()
    db.commit()


def split_showcase(items: list[dict]) -> dict:
    mid = (len(items) + 1) // 2
    return {"top": items[:mid], "bottom": items[mid:]}


def get_favorite_filenames(db: Session) -> list[str]:
    rows = (
        db.query(MediaFile.filename)
        .join(Favorite, Favorite.music_media_id == MediaFile.id)
        .filter(MediaFile.category == "music")
        .all()
    )
    return [r[0] for r in rows]


def add_favorite(db: Session, music_filename: str) -> None:
    music = get_file_with_content(db, "music", music_filename)
    if not music:
        raise ValueError("Трек не найден в разделе «Музыка»")

    if db.query(Favorite).filter(Favorite.music_media_id == music.id).first():
        return

    pl_name = music.filename
    existing_pl = get_file(db, "playlist", pl_name)
    if not existing_pl:
        create_media(db, "playlist", pl_name, bytes(music.content), music.title)

    db.add(Favorite(music_media_id=music.id))
    db.commit()


def remove_favorite(db: Session, music_filename: str) -> None:
    music = get_file(db, "music", music_filename)
    if not music:
        return
    db.query(Favorite).filter(Favorite.music_media_id == music.id).delete()
    pl = get_file(db, "playlist", music_filename)
    if pl:
        db.delete(pl)
    db.commit()


def copy_playlist_from_favorites(db: Session) -> list[MediaFile]:
    return list_by_category(db, "playlist")
