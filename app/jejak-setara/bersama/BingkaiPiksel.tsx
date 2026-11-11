// Bingkai piksel Sehari Setara untuk panel Jejak Setara (Design System 10): garis ink 2 piksel antarmuka, sudut
// terpotong, sorotan putih di sisi atas-dalam, dan latar cream. 1 piksel antarmuka = 2 px CSS (spesifikasi JS-08, P-39).
import type { ReactNode } from "react";

export default function BingkaiPiksel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`js-bingkai js-bingkai-piksel ${className}`.trim()}>{children}</div>;
}
