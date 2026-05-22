import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100dvh] min-h-[100svh] flex-col items-center justify-center px-3 pt-20 text-center sm:px-4 sm:pt-16"
    >
      <motion.div style={{ y, opacity }} className="max-w-4xl">
        <motion.p
          className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-luxury-glow/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          Личный luxury-журнал
        </motion.p>
        <motion.h1
          className="font-display text-[clamp(2.5rem,8vw,5.5rem)] font-light leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          Истории в
          <br />
          <span className="text-gradient-luxury italic">движении и памяти</span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-luxury-silver sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Пространство, где сходятся фотография, кино и музыка — с точностью
          fashion-дома и спокойствием Apple.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          <Link
            to={{ pathname: "/", hash: "showcase" }}
            className="rounded-full bg-white px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-luxury-black transition hover:bg-luxury-glow hover:shadow-glow-lg"
          >
            На витрину
          </Link>
          <Link
            to="/gallery"
            className="rounded-full border border-white/15 px-8 py-3 text-xs uppercase tracking-[0.2em] text-white transition hover:border-luxury-glow/50"
          >
            Галерея
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <div className="h-10 w-px bg-gradient-to-b from-luxury-glow/60 to-transparent" />
      </motion.div>
    </section>
  );
}
