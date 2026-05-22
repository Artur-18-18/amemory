import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useShowcase } from "../hooks/useMedia";
import { MarqueeRow } from "./MarqueeRow";
import { ShowcaseSkeleton } from "./ShowcaseSkeleton";

export function MediaShowcase() {
  const { data, loading, error, refetch } = useShowcase();

  const topRow = data?.rows.top ?? [];
  const bottomRow = data?.rows.bottom ?? [];
  const hasMedia = topRow.length > 0 || bottomRow.length > 0;

  return (
    <section
      id="showcase"
      className="relative overflow-hidden py-16 sm:py-24 md:py-32"
      aria-labelledby="showcase-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

      <div className="relative mx-auto max-w-[100vw] px-4 sm:px-6">
        <motion.header
          className="mb-12 text-center sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-luxury-glow/80">
            Визуальный архив
          </p>
          <h2
            id="showcase-heading"
            className="font-display text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Кинематографическая <span className="text-gradient-luxury italic">витрина</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-luxury-silver sm:text-base">
            Моменты из архива — в бесконечном движении, как lookbook luxury-бренда.
          </p>
        </motion.header>

        {loading && <ShowcaseSkeleton />}

        {error && (
          <div className="glass-card mx-auto max-w-md p-8 text-center">
            <p className="text-luxury-silver">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-4 rounded-full border border-luxury-glow/30 px-6 py-2 text-sm text-white transition hover:border-luxury-glow/60 hover:shadow-glow"
            >
              Повторить
            </button>
          </div>
        )}

        {!loading && !error && !hasMedia && (
          <motion.div
            className="glass-card mx-auto max-w-xl p-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-display text-2xl font-light text-white">Витрина ждёт контент</p>
            <p className="mt-3 text-sm text-luxury-silver">
              Загрузите фото или видео в раздел «Витрина» через{" "}
              <Link to="/admin" className="text-luxury-glow underline">
                админ-панель
              </Link>
              .
            </p>
          </motion.div>
        )}

        {!loading && !error && hasMedia && (
          <motion.div
            className="space-y-5 sm:space-y-7 md:space-y-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <MarqueeRow items={topRow} direction="right" speed={0.28} />
            <MarqueeRow items={bottomRow} direction="left" speed={0.32} />
          </motion.div>
        )}

        {!loading && hasMedia && (
          <p className="mt-10 text-center text-xs tracking-widest text-luxury-silver/60">
            {data?.total ?? 0} работ на витрине · смотреть в{" "}
            <Link to="/gallery" className="text-luxury-glow hover:underline">
              галерее
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
