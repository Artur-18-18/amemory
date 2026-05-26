import time
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .auth import (
    check_admin_password,
    check_memories_password,
    create_token,
    require_admin,
    require_memories,
)
from .config import CLIENT_DIST, DATABASE_URL
from .database import get_db, init_db
from .services import journal as journal_svc
from .services import likes as likes_svc
from .services import media as media_svc
from .services import visits as visits_svc
from .services.migrate_legacy import import_legacy_uploads

app = FastAPI(title="Amemory API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    db = next(get_db())
    try:
        n = import_legacy_uploads(db)
        if n:
            print(f"Imported {n} legacy files into database")
    finally:
        db.close()
    print(f"Database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "service": "amemory",
        "database": "postgresql" if "postgresql" in DATABASE_URL else "sqlite",
        "storage": "sqlalchemy",
    }


@app.get("/uploads/{category}/{filename}")
def serve_upload(category: str, filename: str, db: Session = Depends(get_db)):
    item = media_svc.get_file(db, category, filename)
    if not item:
        raise HTTPException(status_code=404, detail="Файл не найден")
    return Response(content=item.content, media_type=item.mime_type)


@app.get("/api/media")
def api_showcase(db: Session = Depends(get_db)):
    items = media_svc.enrich_items(db, media_svc.list_by_category(db, "showcase"))
    rows = media_svc.split_showcase(items)
    return {"items": items, "rows": rows, "total": len(items)}


@app.get("/api/gallery")
def api_gallery(
    sessionId: str | None = Query(None),
    db: Session = Depends(get_db),
):
    raw = [
        m
        for m in media_svc.list_by_category(db, "showcase")
        if m.media_type in ("image", "video")
    ]
    items = media_svc.enrich_items(db, raw, sessionId)
    return {"items": items, "total": len(items)}


@app.get("/api/music")
def api_music(db: Session = Depends(get_db)):
    items = media_svc.enrich_items(db, media_svc.list_by_category(db, "music"))
    return {
        "items": items,
        "total": len(items),
        "favorites": media_svc.get_favorite_filenames(db),
    }


@app.get("/api/playlist")
def api_playlist(db: Session = Depends(get_db)):
    items = media_svc.enrich_items(db, media_svc.list_by_category(db, "playlist"))
    return {
        "items": items,
        "total": len(items),
        "favorites": media_svc.get_favorite_filenames(db),
    }


@app.get("/api/favorites")
def api_favorites_list(db: Session = Depends(get_db)):
    return {"favorites": media_svc.get_favorite_filenames(db)}


@app.post("/api/favorites")
async def api_favorites_add(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    filename = body.get("filename")
    if not filename:
        raise HTTPException(status_code=400, detail="Укажите файл трека")
    try:
        media_svc.add_favorite(db, filename)
        playlist = media_svc.enrich_items(db, media_svc.list_by_category(db, "playlist"))
        return {
            "ok": True,
            "favorites": media_svc.get_favorite_filenames(db),
            "playlist": playlist,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/favorites/{filename}")
def api_favorites_remove(filename: str, db: Session = Depends(get_db)):
    media_svc.remove_favorite(db, filename)
    return {"ok": True, "favorites": media_svc.get_favorite_filenames(db)}


@app.post("/api/likes/toggle")
async def api_likes_toggle(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    filename = body.get("filename")
    session_id = body.get("sessionId")
    if not filename:
        raise HTTPException(status_code=400, detail="Укажите файл")
    if not session_id:
        raise HTTPException(status_code=400, detail="Укажите sessionId")
    try:
        result = likes_svc.toggle_like(db, filename, session_id)
        return {"ok": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/journal")
def api_journal(db: Session = Depends(get_db)):
    entries = journal_svc.list_entries(db)
    return {"entries": entries, "total": len(entries)}


@app.get("/api/admin/journal")
def api_admin_journal(_: str = Depends(require_admin), db: Session = Depends(get_db)):
    entries = journal_svc.list_entries(db)
    return {"entries": entries, "total": len(entries)}


@app.post("/api/admin/journal")
async def api_journal_create(
    request: Request,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    try:
        entry = journal_svc.create_entry(db, await request.json())
        return {"ok": True, "entry": entry}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/admin/journal/{entry_id}")
async def api_journal_update(
    entry_id: str,
    request: Request,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    try:
        entry = journal_svc.update_entry(db, entry_id, await request.json())
        return {"ok": True, "entry": entry}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/admin/journal/{entry_id}")
def api_journal_delete(
    entry_id: str,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    try:
        journal_svc.delete_entry(db, entry_id)
        return {"ok": True}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/memories")
async def auth_memories(request: Request):
    body = await request.json()
    if not check_memories_password(body.get("password", "")):
        raise HTTPException(status_code=403, detail="Неверный пароль")
    return {"token": create_token("memories", 8), "message": "Доступ открыт"}


@app.post("/api/auth/admin")
async def auth_admin(request: Request):
    body = await request.json()
    if not check_admin_password(body.get("password", "")):
        raise HTTPException(status_code=403, detail="Неверный пароль")
    return {"token": create_token("admin", 12), "message": "Вход выполнен"}


@app.get("/api/memories")
def api_memories(
    _: str = Depends(require_memories),
    db: Session = Depends(get_db),
):
    items = media_svc.enrich_items(db, media_svc.list_by_category(db, "memories"))
    return {"items": items, "total": len(items)}


@app.get("/api/admin/files")
def api_admin_files(_: str = Depends(require_admin), db: Session = Depends(get_db)):
    result = {}
    for cat in ("showcase", "music", "playlist", "memories"):
        raw = media_svc.list_by_category(db, cat)
        items = media_svc.enrich_items(db, raw)
        if cat == "showcase":
            for item in items:
                if item["type"] not in ("image", "video"):
                    item["likes"] = None
        result[cat] = items
    return result


@app.post("/api/admin/upload")
async def api_admin_upload(
    category: str = Query("showcase"),
    file: UploadFile = File(...),
    title: str | None = Form(None),
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Файл не передан")
    content = await file.read()
    filename = f"{int(time.time() * 1000)}-{media_svc.safe_filename(file.filename)}"
    try:
        item = media_svc.create_media(db, category, filename, content, title)
        return {"ok": True, "file": media_svc.media_to_dict(item), "category": category}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/admin/files/{category}/{filename}")
def api_admin_delete(
    category: str,
    filename: str,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    try:
        media_svc.delete_media(db, category, filename)
        return {"ok": True}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.patch("/api/admin/files/{category}/{filename}")
async def api_admin_rename(
    category: str,
    filename: str,
    request: Request,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    body = await request.json()
    title = body.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Укажите название")
    try:
        media_svc.rename_media(db, category, filename, title)
        return {"ok": True}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/visit")
async def api_visit(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    visit = visits_svc.record_visit(db, request, body)
    return {"ok": True, "id": visit["id"]}


@app.get("/api/admin/visits")
def api_admin_visits(
    limit: int = Query(100, le=500),
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return {
        "visits": visits_svc.list_visits(db, limit),
        "stats": visits_svc.visit_stats(db),
    }


@app.delete("/api/admin/visits")
def api_admin_visits_clear(_: str = Depends(require_admin), db: Session = Depends(get_db)):
    visits_svc.clear_visits(db)
    return {"ok": True}


if CLIENT_DIST.exists():
    assets_dir = CLIENT_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def spa_index():
        return FileResponse(CLIENT_DIST / "index.html")

    @app.get("/favicon.svg")
    def favicon():
        path = CLIENT_DIST / "favicon.svg"
        if path.exists():
            return FileResponse(path)
        raise HTTPException(status_code=404)

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404)
        file_path = CLIENT_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(CLIENT_DIST / "index.html")
