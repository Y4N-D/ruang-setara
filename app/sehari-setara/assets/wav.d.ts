// Impor *.wav menghasilkan URL berkas (Vite), seperti png.d.ts. Dipakai manifest.ts untuk efek suara (F-07).
declare module "*.wav" {
  const src: string;
  export default src;
}
