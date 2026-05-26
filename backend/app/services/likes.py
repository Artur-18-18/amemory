from sqlalchemy.orm import Session

from ..models import Like
from .media import get_file, like_count


def toggle_like(db: Session, filename: str, session_id: str, category: str = "showcase") -> dict:
    item = get_file(db, category, filename)
    if not item:
        raise ValueError("Файл не найден")

    existing = (
        db.query(Like)
        .filter(Like.media_id == item.id, Like.session_id == session_id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False, "likes": like_count(db, item.id)}

    db.add(Like(media_id=item.id, session_id=session_id))
    db.commit()
    return {"liked": True, "likes": like_count(db, item.id)}
