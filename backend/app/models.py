from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class MediaFile(Base):
    __tablename__ = "media_files"
    __table_args__ = (UniqueConstraint("category", "filename", name="uq_category_filename"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(32), index=True)
    filename: Mapped[str] = mapped_column(String(512))
    title: Mapped[str] = mapped_column(String(512), default="")
    mime_type: Mapped[str] = mapped_column(String(128), default="application/octet-stream")
    media_type: Mapped[str] = mapped_column(String(16), index=True)
    size: Mapped[int] = mapped_column(Integer, default=0)
    content: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    playlist_order: Mapped[int | None] = mapped_column(Integer, nullable=True)


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    date: Mapped[str] = mapped_column(String(128))
    title: Mapped[str] = mapped_column(String(512))
    excerpt: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (UniqueConstraint("media_id", "session_id", name="uq_like_session"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    media_id: Mapped[int] = mapped_column(ForeignKey("media_files.id", ondelete="CASCADE"), index=True)
    session_id: Mapped[str] = mapped_column(String(128), index=True)


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    music_media_id: Mapped[int] = mapped_column(
        ForeignKey("media_files.id", ondelete="CASCADE"), unique=True
    )


class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    ip: Mapped[str] = mapped_column(String(64), default="—")
    path: Mapped[str] = mapped_column(String(256), default="/")
    session_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    language: Mapped[str] = mapped_column(String(32), default="—")
    referrer: Mapped[str] = mapped_column(String(512), default="—")
    screen_width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    screen_height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    device_type: Mapped[str] = mapped_column(String(32), default="—")
    device_os: Mapped[str] = mapped_column(String(32), default="—")
    device_browser: Mapped[str] = mapped_column(String(32), default="—")
    user_agent: Mapped[str] = mapped_column(String(512), default="")
