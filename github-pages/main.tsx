// Titik masuk versi statis (GitHub Pages). Memuat halaman yang sama dengan app/page.tsx.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import "../app/gallery.css";
import "../app/story.css";
import Page from "../app/page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
