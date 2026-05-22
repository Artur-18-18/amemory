import type {
  AdminFilesResponse,
  JournalEntry,
  JournalResponse,
  ListResponse,
  MediaApiResponse,
  MediaItem,
  TrackVisitPayload,
  VisitsResponse,
} from "./types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
}

function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchJournal(): Promise<JournalResponse> {
  const res = await fetch("/api/journal");
  return parseJson(res);
}

export async function fetchAdminJournal(token: string): Promise<JournalResponse> {
  const res = await fetch("/api/admin/journal", { headers: authHeaders(token) });
  return parseJson(res);
}

export async function createJournalEntry(
  token: string,
  data: Pick<JournalEntry, "date" | "title" | "excerpt">
): Promise<{ ok: boolean; entry: JournalEntry }> {
  const res = await fetch("/api/admin/journal", {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson(res);
}

export async function updateJournalEntry(
  token: string,
  id: string,
  data: Partial<Pick<JournalEntry, "date" | "title" | "excerpt">>
): Promise<{ ok: boolean; entry: JournalEntry }> {
  const res = await fetch(`/api/admin/journal/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson(res);
}

export async function deleteJournalEntry(
  token: string,
  id: string
): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/admin/journal/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function fetchShowcase(): Promise<MediaApiResponse> {
  const res = await fetch("/api/media");
  return parseJson(res);
}

export async function fetchGallery(sessionId?: string): Promise<ListResponse> {
  const q = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
  const res = await fetch(`/api/gallery${q}`);
  return parseJson(res);
}

export async function toggleLike(
  filename: string,
  sessionId: string
): Promise<{ ok: boolean; liked: boolean; likes: number }> {
  const res = await fetch("/api/likes/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, sessionId }),
  });
  return parseJson(res);
}

export interface MusicResponse extends ListResponse {
  favorites?: string[];
}

export interface PlaylistResponse extends ListResponse {
  favorites?: string[];
}

export async function fetchPlaylist(): Promise<PlaylistResponse> {
  const res = await fetch("/api/playlist");
  return parseJson(res);
}

export async function fetchMusic(): Promise<MusicResponse> {
  const res = await fetch("/api/music");
  return parseJson(res);
}

export async function addFavorite(filename: string): Promise<{
  ok: boolean;
  favorites: string[];
  playlist: MediaItem[];
}> {
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  return parseJson(res);
}

export async function removeFavorite(filename: string): Promise<{ ok: boolean; favorites: string[] }> {
  const res = await fetch(`/api/favorites/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  });
  return parseJson(res);
}

export async function loginMemories(password: string): Promise<{ token: string }> {
  const res = await fetch("/api/auth/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return parseJson(res);
}

export async function loginAdmin(password: string): Promise<{ token: string }> {
  const res = await fetch("/api/auth/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return parseJson(res);
}

export async function fetchMemories(token: string): Promise<ListResponse> {
  const res = await fetch("/api/memories", { headers: authHeaders(token) });
  return parseJson(res);
}

export async function fetchAdminFiles(token: string): Promise<AdminFilesResponse> {
  const res = await fetch("/api/admin/files", { headers: authHeaders(token) });
  return parseJson(res);
}

export async function uploadAdminFile(
  token: string,
  file: File,
  category: string,
  title?: string
): Promise<{ ok: boolean; file: unknown }> {
  const form = new FormData();
  form.append("category", category);
  if (title) form.append("title", title);
  form.append("file", file);

  const res = await fetch(
    `/api/admin/upload?category=${encodeURIComponent(category)}`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: form,
    }
  );
  return parseJson(res);
}

export async function deleteAdminFile(
  token: string,
  category: string,
  filename: string
): Promise<{ ok: boolean }> {
  const res = await fetch(
    `/api/admin/files/${category}/${encodeURIComponent(filename)}`,
    { method: "DELETE", headers: authHeaders(token) }
  );
  return parseJson(res);
}

export async function trackVisit(payload: TrackVisitPayload): Promise<void> {
  await fetch("/api/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminVisits(token: string): Promise<VisitsResponse> {
  const res = await fetch("/api/admin/visits", { headers: authHeaders(token) });
  return parseJson(res);
}

export async function clearAdminVisits(token: string): Promise<{ ok: boolean }> {
  const res = await fetch("/api/admin/visits", {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function renameAdminFile(
  token: string,
  category: string,
  filename: string,
  title: string
): Promise<{ ok: boolean }> {
  const res = await fetch(
    `/api/admin/files/${category}/${encodeURIComponent(filename)}`,
    {
      method: "PATCH",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }
  );
  return parseJson(res);
}
