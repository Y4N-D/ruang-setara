// Impor *.png menghasilkan URL berkas (Vite). Dipakai manifest.ts (F-12).
declare module "*.png" {
  const src: string;
  export default src;
}
