import secrets
from collections import Counter

from sqlalchemy.orm import Session

from ..models import Visit


def record_visit(db: Session, req, body: dict) -> dict:
    ua = body.get("userAgent") or req.headers.get("user-agent", "")
    s = ua.lower()
    device_os = "Неизвестно"
    if "windows" in s:
        device_os = "Windows"
    elif "iphone" in s or "ipad" in s:
        device_os = "iOS"
    elif "android" in s:
        device_os = "Android"
    elif "mac" in s:
        device_os = "macOS"
    elif "linux" in s:
        device_os = "Linux"

    device_browser = "Неизвестно"
    if "edg/" in s:
        device_browser = "Edge"
    elif "chrome/" in s and "chromium" not in s:
        device_browser = "Chrome"
    elif "firefox/" in s:
        device_browser = "Firefox"
    elif "safari/" in s and "chrome" not in s:
        device_browser = "Safari"

    device_type = body.get("deviceType") or "Компьютер"
    sw = body.get("screenWidth")
    if sw and sw < 768:
        device_type = "Телефон"
    elif sw and sw < 1024 and device_type == "Компьютер":
        device_type = "Планшет"

    forwarded = req.headers.get("x-forwarded-for", "")
    ip = forwarded.split(",")[0].strip() if forwarded else (req.client.host if req.client else "—")

    visit_id = secrets.token_hex(8)
    visit = Visit(
        id=visit_id,
        ip=ip,
        path=body.get("path", "/"),
        session_id=body.get("sessionId"),
        language=body.get("language") or req.headers.get("accept-language", "—").split(",")[0],
        referrer=body.get("referrer") or req.headers.get("referer", "—"),
        screen_width=body.get("screenWidth"),
        screen_height=body.get("screenHeight"),
        device_type=device_type,
        device_os=device_os,
        device_browser=device_browser,
        user_agent=ua[:300],
    )
    db.add(visit)
    db.commit()
    return {"id": visit_id}


def list_visits(db: Session, limit: int = 100) -> list[dict]:
    rows = db.query(Visit).order_by(Visit.created_at.desc()).limit(limit).all()
    return [
        {
            "id": v.id,
            "at": v.created_at.isoformat() + "Z",
            "ip": v.ip,
            "path": v.path,
            "sessionId": v.session_id,
            "language": v.language,
            "referrer": v.referrer,
            "screen": {"width": v.screen_width, "height": v.screen_height},
            "device": {
                "type": v.device_type,
                "os": v.device_os,
                "browser": v.device_browser,
            },
            "userAgent": v.user_agent,
        }
        for v in rows
    ]


def visit_stats(db: Session) -> dict:
    visits = db.query(Visit).all()
    sessions = {v.session_id for v in visits if v.session_id}
    counter = Counter(f"{v.device_type} · {v.device_os}" for v in visits)
    by_device = [{"name": k, "count": c} for k, c in counter.most_common()]
    return {
        "total": len(visits),
        "uniqueSessions": len(sessions),
        "byDevice": by_device,
    }


def clear_visits(db: Session) -> None:
    db.query(Visit).delete()
    db.commit()
