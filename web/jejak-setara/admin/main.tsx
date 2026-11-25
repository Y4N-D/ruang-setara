// Titik masuk konsol guru dan admin Jejak Setara ("/admin/"). Isinya admin/App.tsx (sejak JS-04).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Huruf VT323 dari paket @fontsource, hanya subset latin berbobot 400 (JS-16b, P-1). Sehari Setara tetap memakai
// kedua huruf lamanya dari paketnya sendiri.
import "@fontsource/vt323/latin-400.css";
import "../../../app/jejak-setara/styles/jejak.css";
import "../../../app/jejak-setara/styles/kelas.css";
import App from "../../../app/jejak-setara/admin/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
