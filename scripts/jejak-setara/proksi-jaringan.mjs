// Proksi jaringan lokal untuk uji ketahanan (spesifikasi JS-15, P-15). Mendengar di 127.0.0.1 dan meneruskan TCP ke
// Worker lokal, dengan latensi dan jitter per arah (urutan potongan data tetap terjaga), serta pemutusan: semua
// sambungan ditutup dan sambungan baru ditolak selama waktu tertentu, serta tersendat: semua data ditahan lalu dilepas
// sekaligus, seperti wifi yang macet lalu pulih (JS-15, D-7 a). Hanya modul bawaan Node.
//   import { buatProksi } from "./proksi-jaringan.mjs";
//   node scripts/jejak-setara/proksi-jaringan.mjs --dengar 4311 --tujuan 4310 --latensi 150 --jitter 25 [--tahan-pada 60 --tahan-lama 6]
import { createConnection, createServer } from "node:net";
import { pathToFileURL } from "node:url";

/**
 * @param {{ portDengar?: number, portTujuan: number, latensiMs?: number, jitterMs?: number }} opsi
 * @returns {Promise<{ port: number, atur: (baru: { latensiMs?: number, jitterMs?: number }) => void, putus: (ms: number) => void, tahan: (ms: number) => void, tutup: () => Promise<void> }>}
 */
export function buatProksi({ portDengar = 0, portTujuan, latensiMs = 0, jitterMs = 0 }) {
  let pengaturan = { latensiMs, jitterMs };
  let tolakSampai = 0;
  let tahanSampai = 0;
  const pasangan = new Set();
  const hancurkan = (p) => {
    p.klien.destroy();
    p.tujuan.destroy();
    pasangan.delete(p);
  };
  // Data satu arah diteruskan dengan tunda lewat satu antrean dan satu pewaktu per arah, sehingga urutan potongan selalu
  // terjaga (pewaktu Node dengan lama berbeda tidak dijamin berurutan). Akhir aliran (`end`) diteruskan sesudah potongan
  // terakhir, agar jawaban yang diikuti penutupan sambungan tidak terpotong.
  const salurkan = (dari, ke) => {
    const antre = [];
    let pewaktu = null;
    let jamTerakhir = 0;
    let akhir = false;
    const kuras = () => {
      pewaktu = null;
      const kini = Date.now();
      while (antre.length > 0 && antre[0].pada <= kini) {
        const { potong } = antre.shift();
        if (!ke.destroyed) ke.write(potong);
      }
      if (antre.length > 0) pewaktu = setTimeout(kuras, Math.max(1, Math.ceil(antre[0].pada - Date.now())));
      else if (akhir && !ke.destroyed) ke.end();
    };
    dari.on("data", (potong) => {
      const { latensiMs: l, jitterMs: j } = pengaturan;
      if (l <= 0 && j <= 0 && antre.length === 0 && Date.now() >= tahanSampai) {
        if (!ke.destroyed) ke.write(potong);
        return;
      }
      jamTerakhir = Math.max(jamTerakhir, Date.now() + l + Math.random() * j, tahanSampai);
      antre.push({ pada: jamTerakhir, potong });
      if (pewaktu === null) pewaktu = setTimeout(kuras, Math.max(1, Math.ceil(antre[0].pada - Date.now())));
    });
    dari.on("end", () => {
      akhir = true;
      if (antre.length === 0 && pewaktu === null && !ke.destroyed) ke.end();
    });
  };
  const server = createServer((klien) => {
    if (Date.now() < tolakSampai) {
      klien.destroy();
      return;
    }
    const tujuan = createConnection({ port: portTujuan, host: "127.0.0.1" });
    const p = { klien, tujuan };
    pasangan.add(p);
    salurkan(klien, tujuan);
    salurkan(tujuan, klien);
    // Galat memutus kedua sisi seketika; penutupan biasa mengikuti `end` di atas.
    for (const s of [klien, tujuan]) {
      s.on("error", () => hancurkan(p));
      s.on("close", () => {
        if (klien.destroyed && tujuan.destroyed) pasangan.delete(p);
      });
    }
  });
  return new Promise((ok, gagal) => {
    server.once("error", gagal);
    server.listen(portDengar, "127.0.0.1", () => {
      const alamat = server.address();
      ok({
        port: typeof alamat === "object" && alamat ? alamat.port : portDengar,
        atur: (baru) => {
          pengaturan = { ...pengaturan, ...baru };
        },
        tahan: (ms) => {
          tahanSampai = Date.now() + ms;
        },
        putus: (ms) => {
          tolakSampai = Date.now() + ms;
          for (const p of [...pasangan]) hancurkan(p);
        },
        tutup: () =>
          new Promise((selesai) => {
            for (const p of [...pasangan]) hancurkan(p);
            server.close(() => selesai());
          }),
      });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = process.argv.slice(2);
  const ambil = (n, b) => Number(arg.indexOf(n) >= 0 ? arg[arg.indexOf(n) + 1] : b);
  const p = await buatProksi({ portDengar: ambil("--dengar", 4311), portTujuan: ambil("--tujuan", 4310), latensiMs: ambil("--latensi", 0), jitterMs: ambil("--jitter", 0) });
  console.log(`Proksi jaringan mendengar di http://127.0.0.1:${p.port}. Ketik "putus 30" atau "tahan 6" (detik), atau Ctrl+C untuk berhenti.`);
  const tahanPada = ambil("--tahan-pada", 0);
  if (tahanPada > 0) setTimeout(() => p.tahan(ambil("--tahan-lama", 6) * 1000), tahanPada * 1000);
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (baris) => {
    const m = /^(putus|tahan) (\d+)/.exec(baris.trim());
    if (m) p[m[1]](Number(m[2]) * 1000);
  });
}
