// Titik masuk halaman game Sehari Setara (GitHub Pages).
// Hanya memuat CSS game; CSS galeri sengaja tidak diimpor di sini.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../app/sehari-setara/styles/game.css";
import Game from "../../app/sehari-setara/Game";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Game />
  </StrictMode>,
);
