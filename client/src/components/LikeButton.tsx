import { motion } from "framer-motion";
import { useState } from "react";
import { toggleLike } from "../api";
import { getSessionId } from "../utils/session";

interface LikeButtonProps {
  filename: string;
  likes: number;
  liked: boolean;
  onUpdate: (liked: boolean, likes: number) => void;
  size?: "sm" | "md";
}

export function LikeButton({
  filename,
  likes,
  liked,
  onUpdate,
  size = "md",
}: LikeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const result = await toggleLike(filename, getSessionId());
      onUpdate(result.liked, result.likes);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  const btnClass =
    size === "sm"
      ? "h-8 gap-1 px-2 text-xs"
      : "h-9 gap-1.5 px-3 text-sm sm:h-10";

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={loading}
      whileTap={{ scale: 0.9 }}
      className={[
        "inline-flex items-center rounded-full border backdrop-blur-md transition",
        btnClass,
        liked
          ? "border-red-400/50 bg-red-500/20 text-red-300"
          : "border-white/20 bg-black/50 text-white hover:border-red-400/40 hover:bg-red-500/10",
      ].join(" ")}
      aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
    >
      <span className={liked ? "text-red-400" : ""}>{loading ? "…" : liked ? "♥" : "♡"}</span>
      <span className="font-medium tabular-nums">{likes}</span>
    </motion.button>
  );
}
