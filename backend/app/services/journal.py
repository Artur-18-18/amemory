import secrets

from sqlalchemy.orm import Session

from ..models import JournalEntry

DEFAULT_ENTRIES = [
    {
        "date": "Май 2026",
        "title": "Тихая скорость",
        "excerpt": "Между огнями города и прибрежной тишиной — исследование контраста на плёнке и в цифровом кино.",
    },
    {
        "date": "Апрель 2026",
        "title": "Часы matte black",
        "excerpt": "Часы до рассвета несут другую тяжесть. Заметки о ремесле, сдержанности и роскоши медленности.",
    },
    {
        "date": "Март 2026",
        "title": "Фиолетовый час, Женева",
        "excerpt": "Дневник выходных у озера — архитектура, крой и звук дождя по стеклу.",
    },
]


def entry_to_dict(e: JournalEntry) -> dict:
    return {
        "id": e.id,
        "date": e.date,
        "title": e.title,
        "excerpt": e.excerpt,
        "order": e.sort_order,
    }


def seed_if_empty(db: Session) -> None:
    if db.query(JournalEntry).count() > 0:
        return
    for i, data in enumerate(DEFAULT_ENTRIES):
        db.add(
            JournalEntry(
                id=secrets.token_hex(8),
                date=data["date"],
                title=data["title"],
                excerpt=data["excerpt"],
                sort_order=i,
            )
        )
    db.commit()


def list_entries(db: Session) -> list[dict]:
    seed_if_empty(db)
    rows = db.query(JournalEntry).order_by(JournalEntry.sort_order.asc()).all()
    return [entry_to_dict(e) for e in rows]


def create_entry(db: Session, data: dict) -> dict:
    if not data.get("date") or not data.get("title"):
        raise ValueError("Укажите дату и заголовок")
    max_order = db.query(JournalEntry).count()
    entry = JournalEntry(
        id=secrets.token_hex(8),
        date=data["date"].strip(),
        title=data["title"].strip(),
        excerpt=(data.get("excerpt") or "").strip(),
        sort_order=max_order,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry_to_dict(entry)


def update_entry(db: Session, entry_id: str, data: dict) -> dict:
    entry = db.get(JournalEntry, entry_id)
    if not entry:
        raise ValueError("Запись не найдена")
    if "date" in data and data["date"] is not None:
        entry.date = data["date"].strip()
    if "title" in data and data["title"] is not None:
        entry.title = data["title"].strip()
    if "excerpt" in data and data["excerpt"] is not None:
        entry.excerpt = data["excerpt"].strip()
    db.commit()
    db.refresh(entry)
    return entry_to_dict(entry)


def delete_entry(db: Session, entry_id: str) -> None:
    entry = db.get(JournalEntry, entry_id)
    if not entry:
        raise ValueError("Запись не найдена")
    db.delete(entry)
    db.commit()
