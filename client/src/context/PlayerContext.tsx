import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { addFavorite, fetchMusic, fetchPlaylist, removeFavorite } from "../api";
import { GlobalPlayer } from "../components/GlobalPlayer";
import type { MediaItem } from "../types";

export type QueueSource = "music" | "playlist" | null;

interface PlayerContextValue {
  queue: MediaItem[];
  source: QueueSource;
  sourceLabel: string;
  currentIndex: number;
  playing: boolean;
  progress: number;
  duration: number;
  musicTracks: MediaItem[];
  playlistTracks: MediaItem[];
  favorites: string[];
  libraryReady: boolean;
  hasQueue: boolean;
  setQueue: (tracks: MediaItem[], source: QueueSource, label: string, startIndex?: number) => void;
  playIndex: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  refreshLibrary: () => Promise<void>;
  toggleFavorite: (filename: string) => Promise<void>;
  isFavorite: (filename: string) => boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [musicTracks, setMusicTracks] = useState<MediaItem[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<MediaItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);

  const [queue, setQueueState] = useState<MediaItem[]>([]);
  const [source, setSource] = useState<QueueSource>(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const hidePlayer = location.pathname.startsWith("/admin");
  const hasQueue = queue.length > 0;

  const refreshLibrary = useCallback(async () => {
    const [music, playlist] = await Promise.all([fetchMusic(), fetchPlaylist()]);
    setMusicTracks(music.items);
    setPlaylistTracks(playlist.items);
    setFavorites(music.favorites || playlist.favorites || []);
  }, []);

  useEffect(() => {
    refreshLibrary()
      .catch(() => {})
      .finally(() => setLibraryReady(true));

    const onRefresh = () => refreshLibrary().catch(() => {});
    window.addEventListener("amemory-library-refresh", onRefresh);
    return () => window.removeEventListener("amemory-library-refresh", onRefresh);
  }, [refreshLibrary]);

  const track = queue[currentIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.url;
    audio.load();
  }, [track?.id, track?.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing, track?.id]);

  const isFavorite = useCallback(
    (filename: string) => favorites.includes(filename),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (filename: string) => {
      if (isFavorite(filename)) {
        await removeFavorite(filename);
      } else {
        await addFavorite(filename);
      }
      await refreshLibrary();
    },
    [isFavorite, refreshLibrary]
  );

  const setQueue = useCallback(
    (tracks: MediaItem[], src: QueueSource, label: string, startIndex = 0) => {
      if (tracks.length === 0) return;
      setQueueState(tracks);
      setSource(src);
      setSourceLabel(label);
      setCurrentIndex(Math.min(startIndex, tracks.length - 1));
      setPlaying(true);
      setProgress(0);
    },
    []
  );

  const playIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    setCurrentIndex((i) => (i + 1) % queue.length);
    setPlaying(true);
  }, [queue.length]);

  const prev = useCallback(() => {
    if (queue.length === 0) return;
    setCurrentIndex((i) => (i - 1 + queue.length) % queue.length);
    setPlaying(true);
  }, [queue.length]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = time;
    setProgress(time);
  }, []);

  const value: PlayerContextValue = {
    queue,
    source,
    sourceLabel,
    currentIndex,
    playing,
    progress,
    duration,
    musicTracks,
    playlistTracks,
    favorites,
    libraryReady,
    hasQueue,
    setQueue,
    playIndex,
    togglePlay,
    next,
    prev,
    seek,
    refreshLibrary,
    toggleFavorite,
    isFavorite,
  };

  return (
    <PlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        className="hidden"
        preload="metadata"
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={next}
      />
      <div className={hasQueue && !hidePlayer ? "pb-[5.5rem] sm:pb-[6.5rem]" : ""}>
        {children}
      </div>
      {!hidePlayer && <GlobalPlayer />}
    </PlayerContext.Provider>
  );
}
