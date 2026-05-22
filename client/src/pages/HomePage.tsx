import { About } from "../components/About";
import { Hero } from "../components/Hero";
import { Journal } from "../components/Journal";
import { MediaShowcase } from "../components/MediaShowcase";

export function HomePage() {
  return (
    <>
      <Hero />
      <MediaShowcase />
      <Journal />
      <About />
    </>
  );
}
