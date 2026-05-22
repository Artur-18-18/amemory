import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "../types";
import { MediaCard } from "./MediaCard";

export type MarqueeDirection = "right" | "left";

interface MarqueeRowProps {
  items: MediaItem[];
  direction: MarqueeDirection;
  speed?: number;
  className?: string;
}

const MIN_ITEMS_FOR_LOOP = 3;

function duplicateItems(items: MediaItem[], minCount: number): MediaItem[] {
  if (items.length === 0) return [];
  const copies = Math.ceil(minCount / items.length) + 1;
  const result: MediaItem[] = [];
  for (let c = 0; c < copies; c++) {
    items.forEach((item, i) => {
      result.push({ ...item, id: `${item.id}-copy-${c}-${i}` });
    });
  }
  return result;
}

export function MarqueeRow({
  items,
  direction,
  speed = 0.35,
  className = "",
}: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const x = useMotionValue(0);
  const offsetRef = useRef(0);

  const loopItems = duplicateItems(items, MIN_ITEMS_FOR_LOOP * 2);
  const displayItems = [...loopItems, ...loopItems];

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half > 0) setSegmentWidth(half);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, displayItems.length]);

  useAnimationFrame((_, delta) => {
    if (paused || segmentWidth <= 0) return;

    const deltaSec = delta / 1000;
    const pxPerSec = speed * 60;
    const step = pxPerSec * deltaSec * (direction === "right" ? 1 : -1);

    let next = offsetRef.current + step;

    if (direction === "right") {
      while (next >= 0) next -= segmentWidth;
    } else {
      while (next <= -segmentWidth) next += segmentWidth;
    }

    offsetRef.current = next;
    x.set(next);
  });

  useEffect(() => {
    if (segmentWidth <= 0) return;
    offsetRef.current = direction === "right" ? -segmentWidth : 0;
    x.set(offsetRef.current);
  }, [segmentWidth, direction, x]);

  if (items.length === 0) return null;

  return (
    <div
      className={`marquee-mask relative w-full overflow-hidden ${className}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onTouchCancel={() => setPaused(false)}
    >
      <motion.div
        ref={trackRef}
        className="flex w-max gap-4 sm:gap-5 md:gap-6"
        style={{ x, willChange: "transform" }}
      >
        {displayItems.map((item, index) => (
          <MediaCard key={item.id} item={item} index={index % items.length} paused={paused} />
        ))}
      </motion.div>
    </div>
  );
}
