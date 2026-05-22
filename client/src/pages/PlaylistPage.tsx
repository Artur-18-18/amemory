import { motion } from "framer-motion";
import { usePlayer } from "../context/PlayerContext";
import { TrackList } from "../components/TrackList";

export function PlaylistPage() {
  const { playlistTracks, libraryReady } = usePlayer();

  return (
    <section className="py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.header
          className="mb-10 text-center sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-luxury-glow/80">Подборка</p>
          <h1 className="font-display text-3xl font-light sm:text-4xl md:text-5xl">
            <span className="text-gradient-luxury italic">Плейлист</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-luxury-silver">
            Треки из избранного (★ в разделе «Музыка») и загруженные в админке. Воспроизведение
            не прервётся при переходе на другие страницы.
          </p>
        </motion.header>

        {!libraryReady ? (
          <div className="glass-card h-40 shimmer-bg animate-shimmer sm:h-48" />
        ) : (
          <TrackList tracks={playlistTracks} source="playlist" sourceLabel="Плейлист" />
        )}
      </div>
    </section>
  );
}
