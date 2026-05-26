import { motion } from "framer-motion";
import { usePlayer } from "../context/PlayerContext";
import { TrackList } from "../components/TrackList";

export function MusicPage() {
  const { musicTracks, libraryReady } = usePlayer();

  return (
    <section className="py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.header
          className="mb-10 text-center sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-luxury-glow/80">Звук</p>
          <h1 className="font-display text-3xl font-light sm:text-4xl md:text-5xl">
            <span className="text-gradient-luxury italic">Музыка</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-luxury-silver">
            Личная коллекция. Музыка продолжит играть внизу экрана при переходе на другие
            страницы.
          </p>
        </motion.header>

        {!libraryReady ? (
          <div className="glass-card h-40 shimmer-bg animate-shimmer sm:h-48" />
        ) : (
          <TrackList
            tracks={musicTracks}
            source="music"
            sourceLabel="Музыка"
            showFavorites
            showDownload
          />
        )}
      </div>
    </section>
  );
}
