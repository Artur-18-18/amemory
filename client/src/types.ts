export type MediaType = "image" | "video" | "audio";
export type Category = "showcase" | "music" | "playlist" | "memories";

export interface MediaItem {
  id: string;
  filename: string;
  category?: Category;
  type: MediaType;
  title?: string;
  url: string;
  mimeType: string;
  size: number;
  modifiedAt: string;
  likes?: number;
  liked?: boolean;
}

export interface MediaApiResponse {
  items: MediaItem[];
  rows: {
    top: MediaItem[];
    bottom: MediaItem[];
  };
  total: number;
}

export interface ListResponse {
  items: MediaItem[];
  total: number;
}

export interface AdminFilesResponse {
  showcase: MediaItem[];
  music: MediaItem[];
  playlist: MediaItem[];
  memories: MediaItem[];
}

export interface VisitDevice {
  type: string;
  os: string;
  browser: string;
}

export interface VisitRecord {
  id: string;
  at: string;
  ip: string;
  path: string;
  sessionId: string | null;
  language: string;
  referrer: string;
  screen: { width: number | null; height: number | null };
  device: VisitDevice;
  userAgent: string;
}

export interface VisitStats {
  total: number;
  uniqueSessions: number;
  byDevice: { name: string; count: number }[];
}

export interface VisitsResponse {
  visits: VisitRecord[];
  stats: VisitStats;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  order?: number;
}

export interface JournalResponse {
  entries: JournalEntry[];
  total: number;
}

export interface TrackVisitPayload {
  path: string;
  sessionId: string;
  language: string;
  referrer: string;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  deviceType: string;
}
