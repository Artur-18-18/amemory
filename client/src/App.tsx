import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { VisitTracker } from "./components/VisitTracker";
import { PlayerProvider } from "./context/PlayerContext";
import { AdminPage } from "./pages/AdminPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { MemoriesPage } from "./pages/MemoriesPage";
import { MusicPage } from "./pages/MusicPage";
import { PlaylistPage } from "./pages/PlaylistPage";

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <VisitTracker />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/playlist" element={<PlaylistPage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Layout>
      </PlayerProvider>
    </BrowserRouter>
  );
}
