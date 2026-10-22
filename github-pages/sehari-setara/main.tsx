// Titik masuk halaman game Sehari Setara (GitHub Pages).
// Hanya memuat CSS game; CSS galeri sengaja tidak diimpor di sini.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Huruf piksel dari paket @fontsource, hanya subset latin berbobot 400 (Architecture keputusan A11; F-04).
import "@fontsource/press-start-2p/latin-400.css";
import "@fontsource/pixelify-sans/latin-400.css";
import "../../app/sehari-setara/styles/game.css";
import Game from "../../app/sehari-setara/Game";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Game />
  </StrictMode>,
);
