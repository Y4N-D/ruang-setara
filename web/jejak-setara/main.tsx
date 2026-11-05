// Titik masuk halaman pemain Jejak Setara ("/"). JS-01: halaman kosong.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Huruf piksel dari paket @fontsource, hanya subset latin berbobot 400, seperti Sehari Setara (keputusan A11).
import "@fontsource/press-start-2p/latin-400.css";
import "@fontsource/pixelify-sans/latin-400.css";
import "../../app/jejak-setara/styles/jejak.css";
import App from "../../app/jejak-setara/pemain/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
