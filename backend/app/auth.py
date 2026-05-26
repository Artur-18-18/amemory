import secrets
import time
from typing import Literal

from fastapi import Depends, Header, HTTPException

from .config import ADMIN_PASSWORD, MEMORIES_PASSWORD

_sessions: dict[str, dict] = {}


def create_token(kind: Literal["admin", "memories"], hours: float = 12) -> str:
    token = secrets.token_hex(32)
    _sessions[token] = {"type": kind, "exp": time.time() + hours * 3600}
    return token


def verify_token(token: str | None, kind: str) -> bool:
    if not token:
        return False
    session = _sessions.get(token)
    if not session or session["type"] != kind:
        return False
    if time.time() > session["exp"]:
        _sessions.pop(token, None)
        return False
    return True


def _parse_bearer(authorization: str | None = Header(None)) -> str | None:
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:]
    return None


def require_admin(token: str | None = Depends(_parse_bearer)):
    if not verify_token(token, "admin"):
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    return token


def require_memories(token: str | None = Depends(_parse_bearer)):
    if not verify_token(token, "memories"):
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    return token


def check_memories_password(password: str) -> bool:
    return password == MEMORIES_PASSWORD


def check_admin_password(password: str) -> bool:
    return password == ADMIN_PASSWORD
