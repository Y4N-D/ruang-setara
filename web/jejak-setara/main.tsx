// Titik masuk halaman pemain Jejak Setara ("/"). JS-01: halaman kosong.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Huruf piksel dari paket @fontsource, hanya subset latin berbobot 400, seperti Sehari Setara (keputusan A11).
import "@fontsource/press-start-2p/latin-400.css";
import "@fontsource/pixelify-sans/latin-400.css";
import "../../app/jejak-setara/styles/jejak.css";
import App from "../../app/jejak-setara/pemain/App";
import LayarPratinjau from "../../app/jejak-setara/pemain/LayarPratinjau";

// JS-12 (P-12): `?pratinjau=1` dipakai bingkai penyunting konsol; tanpa sambungan ke ruang.
const pratinjau = new URLSearchParams(location.search).has("pratinjau");

createRoot(document.getElementById("root")!).render(<StrictMode>{pratinjau ? <LayarPratinjau /> : <App />}</StrictMode>);
