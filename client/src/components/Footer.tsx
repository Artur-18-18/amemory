import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t border-white/[0.04] py-8 sm:py-10"
      style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-3 text-center text-xs text-luxury-silver sm:flex-row sm:px-6 sm:text-left">
        <Link to="/" className="font-display text-lg text-white">
          Amemory
        </Link>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link to="/gallery" className="hover:text-white">
            Галерея
          </Link>
          <Link to="/music" className="hover:text-white">
            Музыка
          </Link>
          <Link to="/playlist" className="hover:text-white">
            Плейлист
          </Link>
          <Link to="/memories" className="hover:text-white">
            Воспоминания
          </Link>
        </nav>
        <p>© {year} — Создано для кинематографических историй</p>
      </div>
    </footer>
  );
}
