import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackVisit } from "../api";

const SESSION_KEY = "amemory_session_id";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;

    const key = `visit_logged_${location.pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    trackVisit({
      path: location.pathname,
      sessionId: getSessionId(),
      language: navigator.language,
      referrer: document.referrer || "—",
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      userAgent: navigator.userAgent,
      deviceType:
        /Mobi|Android/i.test(navigator.userAgent)
          ? "Телефон"
          : window.screen.width < 1024
            ? "Планшет"
            : "Компьютер",
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}
