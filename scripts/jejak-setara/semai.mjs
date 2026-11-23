// Semai bank awal Jejak Setara ke D1 (spesifikasi JS-05; Architecture JA-10 dan 10.6).
//
// Pemakaian (dari folder repositori):
//   node scripts/jejak-setara/semai.mjs --sql                        cetak SQL semai ke layar
//   node scripts/jejak-setara/semai.mjs --jalankan [-- <bendera>]    jalankan lewat "wrangler d1 execute"
//
// Bendera sesudah "--" diteruskan ke wrangler, misalnya --local, --remote, --env uji, atau --persist-to <folder>.
// Tanpa --local maupun --remote, semai memakai basis data lokal (--local).
//
// Semua rujukan selalu disemai berstatus 'belum'; skrip ini tidak pernah menulis 'terverifikasi'.
// Bank awal disemai sekali per basis data: setiap pernyataan hanya berlaku selama penanda 'semai_bank_awal'
// belum ada di tabel pengaturan, jadi menjalankan ulang tidak menimpa suntingan konsol.
// Tabelnya dari migrasi 0001_awal.sql (JS-03): id kejadian, versi, dan paket berupa UUID teks, yang di sini
// dihitung tetap dari kode atau nama (Revisi 1 spesifikasi JS-05, P-40).
//
// Semai tambahan (spesifikasi JS-05-semai-tambahan): bila server/jejak-setara/seed/bank-tambahan-1.json ada,
// --jalankan menyemainya sesudah bank awal dengan penanda 'semai_tambahan_1', semua atau tidak sama sekali:
// tidak ada yang ditulis bila bank awal belum disemai atau kode, nomor, atau nama paketnya sudah terpakai.
// Sesudah itu statusnya dibaca dan dicetak. --sql tetap mencetak SQL bank awal saja.
// Dengan JEJAK_SEMAI_TANPA_TAMBAHAN=1, --jalankan hanya menyemai bank awal, persis seperti JS-05. Variabel ini
// dipasang server-lokal.mjs (Permintaan A-18), agar uji server, uji ujung ke ujung, dan sim:beban tetap memakai
// bank awal saja (Revisi 1 spesifikasi JS-05-semai-tambahan, P-17a). Deploy tidak memasangnya.
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const AKAR = fileURLToPath(new URL("../../", import.meta.url));
export const JALUR_BANK = "server/jejak-setara/seed/bank-awal.json";
export const JALUR_WRANGLER = "server/jejak-setara/wrangler.jsonc";
export const BINDING_D1 = "DB";
export const PENANDA = "semai_bank_awal";
export const CATATAN_VERSI = "Bank awal dari repositori (JS-05)";
/** UUID dasar (ruang nama RFC 9562) untuk id bank awal. Jangan diubah: id yang sudah disemai bergantung padanya. */
export const DASAR_ID = "93b81e4c-d848-4d2b-9c6a-230da39a8daf";

const PESAN_PAKAI = [
  "Pemakaian:",
  "  node scripts/jejak-setara/semai.mjs --sql",
  "  node scripts/jejak-setara/semai.mjs --jalankan [-- <bendera wrangler>]",
].join("\n");
export const PESAN_BELUM = `Belum tersedia: D1 belum disiapkan di ${JALUR_WRANGLER} (dibuat di JS-03).`;

/** Teks SQL berkutip tunggal; null menjadi NULL. */
export function kutip(nilai) {
  if (nilai === null) return "NULL";
  if (typeof nilai !== "string") throw new TypeError("kutip: nilai harus teks atau null");
  if (nilai.includes("\u0000")) throw new RangeError("kutip: teks berisi karakter NUL");
  return `'${nilai.replaceAll("'", "''")}'`;
}

const rekaman = (x) => typeof x === "object" && x !== null && !Array.isArray(x);
const teks = (x) => typeof x === "string";

/**
 * Baca teks berkas bank awal dan periksa bentuk dasarnya. Pemeriksaan lengkap (skema dan aturan
 * Architecture 5.4) dijalankan content:check:jejak. Melempar Error berisi alasan bila tidak sah.
 */
export function bacaBank(isiBerkas) {
  let bank;
  try {
    bank = JSON.parse(isiBerkas);
  } catch {
    throw new Error("berkas bukan JSON yang sah");
  }
  if (!rekaman(bank) || bank.versi !== 1) throw new Error("versi bank harus 1");
  for (const bagian of ["rujukan", "kejadian", "paket"]) {
    if (!Array.isArray(bank[bagian]) || bank[bagian].length === 0) throw new Error(`daftar ${bagian} kosong atau tidak ada`);
  }
  for (const r of bank.rujukan) {
    const id = rekaman(r) && teks(r.id) ? r.id : "?";
    if (!rekaman(r) || !teks(r.id) || !teks(r.teks) || !teks(r.sumber) || !teks(r.catatan) || !(r.kodeSehari === null || teks(r.kodeSehari))) {
      throw new Error(`rujukan ${id} tidak lengkap`);
    }
    if (Object.hasOwn(r, "status")) throw new Error(`rujukan ${id} punya kolom status`);
  }
  for (const k of bank.kejadian) if (!rekaman(k) || !teks(k.kode)) throw new Error("ada kejadian tanpa kode");
  for (const p of bank.paket) {
    if (!rekaman(p) || !teks(p.nama) || !teks(p.deskripsi) || !Array.isArray(p.kejadian) || !p.kejadian.every(teks)) {
      throw new Error(`paket ${rekaman(p) && teks(p.nama) ? p.nama : "?"} tidak lengkap`);
    }
  }
  return bank;
}

/** UUID versi 5 (RFC 9562 bagian 5.5): SHA-1 dari 16 byte UUID dasar lalu nama UTF-8, huruf kecil. */
export function uuid5(dasar, nama) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dasar)) throw new RangeError("uuid5: UUID dasar tidak sah");
  const hash = createHash("sha1").update(Buffer.from(dasar.replaceAll("-", ""), "hex")).update(nama, "utf8").digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const h = hash.subarray(0, 16).toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
/** Id tetap baris bank awal (P-40). */
export const idKejadian = (kode) => uuid5(DASAR_ID, `kejadian/${kode}`);
export const idVersiPertama = (kode) => uuid5(DASAR_ID, `kejadian_versi/${kode}/1`);
export const idPaket = (nama) => uuid5(DASAR_ID, `paket/${nama}`);

const BELUM_DISEMAI = `NOT EXISTS (SELECT 1 FROM pengaturan WHERE kunci = ${kutip(PENANDA)})`;
const WAKTU = "CAST(strftime('%s', 'now') AS INTEGER) * 1000";

/**
 * Pernyataan SQL semai, satu per baris, tanpa BEGIN dan COMMIT. Setiap INSERT … SELECT punya WHERE.
 * Tabrakan pada kunci utama atau kunci unik mana pun diabaikan (ON CONFLICT DO NOTHING).
 */
export function sqlSemai(bank) {
  const s = [];
  for (const r of bank.rujukan) {
    s.push(
      `INSERT INTO rujukan (id, teks, sumber, status, catatan, kode_sehari) SELECT ${kutip(r.id)}, ${kutip(r.teks)}, ${kutip(r.sumber)}, 'belum', ${kutip(r.catatan)}, ${kutip(r.kodeSehari)} WHERE ${BELUM_DISEMAI} ON CONFLICT (id) DO NOTHING;`,
    );
  }
  for (const k of bank.kejadian) {
    s.push(
      `INSERT INTO kejadian (id, kode, status, versi_terbit_id, pemilik_id, diubah_pada) SELECT ${kutip(idKejadian(k.kode))}, ${kutip(k.kode)}, 'tinjau', NULL, NULL, ${WAKTU} WHERE ${BELUM_DISEMAI} ON CONFLICT DO NOTHING;`,
    );
    s.push(
      `INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) SELECT ${kutip(idVersiPertama(k.kode))}, k.id, 1, ${kutip(JSON.stringify(k))}, 'kerja', NULL, ${WAKTU}, ${kutip(CATATAN_VERSI)} FROM kejadian k WHERE k.kode = ${kutip(k.kode)} AND ${BELUM_DISEMAI} AND NOT EXISTS (SELECT 1 FROM kejadian_versi v WHERE v.kejadian_id = k.id) ON CONFLICT DO NOTHING;`,
    );
  }
  for (const p of bank.paket) {
    s.push(
      `INSERT INTO paket (id, nama, deskripsi, aktif) SELECT ${kutip(idPaket(p.nama))}, ${kutip(p.nama)}, ${kutip(p.deskripsi)}, 1 WHERE ${BELUM_DISEMAI} ON CONFLICT DO NOTHING;`,
    );
    p.kejadian.forEach((kode, i) => {
      s.push(
        `INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) SELECT p.id, k.id, ${i + 1} FROM paket p, kejadian k WHERE p.id = ${kutip(idPaket(p.nama))} AND k.kode = ${kutip(kode)} AND ${BELUM_DISEMAI} ON CONFLICT DO NOTHING;`,
      );
    });
  }
  const ringkas = { versi: bank.versi, rujukan: bank.rujukan.length, kejadian: bank.kejadian.length, paket: bank.paket.length };
  s.push(`INSERT INTO pengaturan (kunci, nilai_json) VALUES (${kutip(PENANDA)}, ${kutip(JSON.stringify(ringkas))}) ON CONFLICT (kunci) DO NOTHING;`);
  return s;
}

/** Isi berkas SQL yang dijalankan: satu baris keterangan, lalu pernyataan semai. */
export function teksSql(bank) {
  return [`-- Semai bank awal Jejak Setara (JS-05), dibuat oleh scripts/jejak-setara/semai.mjs dari ${JALUR_BANK}.`, ...sqlSemai(bank), ""].join("\n");
}

// -------------------------------------------------------------------------------------------
// Semai tambahan (spesifikasi JS-05-semai-tambahan, P-9 sampai P-18)

export const JALUR_TAMBAHAN = "server/jejak-setara/seed/bank-tambahan-1.json";
export const PENANDA_TAMBAHAN = "semai_tambahan_1";
export const IZIN_TAMBAHAN = "semai_tambahan_1_izin";
export const CATATAN_VERSI_TAMBAHAN = "Kejadian tambahan dari repositori (semai tambahan 1)";
/** Variabel lingkungan server uji lokal: bila bernilai "1", semai tambahan dilewati (Revisi 1, P-17a). */
export const VARIABEL_TANPA_TAMBAHAN = "JEJAK_SEMAI_TANPA_TAMBAHAN";
export const PESAN_TAMBAHAN_DILEWATI = `Semai tambahan dilewati (${VARIABEL_TANPA_TAMBAHAN}=1).`;
/**
 * Benar hanya bila variabel itu bernilai tepat "1"; nilai lain tidak melewati apa pun (P-17a).
 * @param {Readonly<Record<string, string | undefined>>} [lingkungan]
 */
export const tambahanDilewati = (lingkungan = process.env) => lingkungan[VARIABEL_TANPA_TAMBAHAN] === "1";

const daftarKutip = (nilai) => nilai.map(kutip).join(", ");
const kodeTambahan = (bank) => bank.kejadian.map((k) => k.kode);
const idRujukanTambahan = (bank) => bank.rujukan.map((r) => r.id);
const namaPaketTambahan = (bank) => bank.paket.map((p) => p.nama);

/**
 * Pernyataan SQL semai tambahan (P-9 sampai P-14): izin, rujukan, kejadian dan versinya, paket dan isinya,
 * penanda, lalu penghapusan izin. Izin hanya ditulis bila penanda tambahan belum ada, penanda bank awal sudah
 * ada, dan tidak satu pun kode kejadian, id rujukan, atau nama paket bank ini sudah ada (P-10). Sisipan lain
 * hanya berlaku selama izin ada dan penanda belum ada (P-11).
 */
export function sqlSemaiTambahan(bank) {
  const belum = `NOT EXISTS (SELECT 1 FROM pengaturan WHERE kunci = ${kutip(PENANDA_TAMBAHAN)})`;
  const izin = `EXISTS (SELECT 1 FROM pengaturan WHERE kunci = ${kutip(IZIN_TAMBAHAN)})`;
  const awal = `EXISTS (SELECT 1 FROM pengaturan WHERE kunci = ${kutip(PENANDA)})`;
  const bebas =
    `NOT EXISTS (SELECT 1 FROM kejadian WHERE kode IN (${daftarKutip(kodeTambahan(bank))})) ` +
    `AND NOT EXISTS (SELECT 1 FROM rujukan WHERE id IN (${daftarKutip(idRujukanTambahan(bank))})) ` +
    `AND NOT EXISTS (SELECT 1 FROM paket WHERE nama IN (${daftarKutip(namaPaketTambahan(bank))}))`;
  const syarat = `${belum} AND ${izin}`;
  const s = [
    `INSERT INTO pengaturan (kunci, nilai_json) SELECT ${kutip(IZIN_TAMBAHAN)}, ${kutip("{}")} WHERE ${belum} AND ${awal} AND ${bebas} ON CONFLICT (kunci) DO NOTHING;`,
  ];
  for (const r of bank.rujukan) {
    s.push(
      `INSERT INTO rujukan (id, teks, sumber, status, catatan, kode_sehari) SELECT ${kutip(r.id)}, ${kutip(r.teks)}, ${kutip(r.sumber)}, 'belum', ${kutip(r.catatan)}, ${kutip(r.kodeSehari)} WHERE ${syarat} ON CONFLICT (id) DO NOTHING;`,
    );
  }
  for (const k of bank.kejadian) {
    s.push(
      `INSERT INTO kejadian (id, kode, status, versi_terbit_id, pemilik_id, diubah_pada) SELECT ${kutip(idKejadian(k.kode))}, ${kutip(k.kode)}, 'tinjau', NULL, NULL, ${WAKTU} WHERE ${syarat} ON CONFLICT DO NOTHING;`,
    );
    s.push(
      `INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) SELECT ${kutip(idVersiPertama(k.kode))}, k.id, 1, ${kutip(JSON.stringify(k))}, 'kerja', NULL, ${WAKTU}, ${kutip(CATATAN_VERSI_TAMBAHAN)} FROM kejadian k WHERE k.kode = ${kutip(k.kode)} AND ${syarat} AND NOT EXISTS (SELECT 1 FROM kejadian_versi v WHERE v.kejadian_id = k.id) ON CONFLICT DO NOTHING;`,
    );
  }
  for (const p of bank.paket) {
    s.push(
      `INSERT INTO paket (id, nama, deskripsi, aktif) SELECT ${kutip(idPaket(p.nama))}, ${kutip(p.nama)}, ${kutip(p.deskripsi)}, 1 WHERE ${syarat} ON CONFLICT DO NOTHING;`,
    );
    p.kejadian.forEach((kode, i) => {
      s.push(
        `INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) SELECT p.id, k.id, ${i + 1} FROM paket p, kejadian k WHERE p.id = ${kutip(idPaket(p.nama))} AND k.kode = ${kutip(kode)} AND ${syarat} ON CONFLICT DO NOTHING;`,
      );
    });
  }
  const ringkas = { versi: bank.versi, rujukan: bank.rujukan.length, kejadian: bank.kejadian.length, paket: bank.paket.length };
  s.push(`INSERT INTO pengaturan (kunci, nilai_json) SELECT ${kutip(PENANDA_TAMBAHAN)}, ${kutip(JSON.stringify(ringkas))} WHERE ${izin} ON CONFLICT (kunci) DO NOTHING;`);
  s.push(`DELETE FROM pengaturan WHERE kunci = ${kutip(IZIN_TAMBAHAN)};`);
  return s;
}

/** Isi SQL semai tambahan: satu baris keterangan, lalu pernyataannya. */
export function teksSqlTambahan(bank) {
  return [
    `-- Semai tambahan Jejak Setara (lanjutan JS-05), dibuat oleh scripts/jejak-setara/semai.mjs dari ${JALUR_TAMBAHAN}.`,
    ...sqlSemaiTambahan(bank),
    "",
  ].join("\n");
}

/** Kueri status (P-15): satu baris berkolom sudah, awal, dan ada. */
export function sqlStatusTambahan(bank) {
  return (
    `SELECT (SELECT count(*) FROM pengaturan WHERE kunci = ${kutip(PENANDA_TAMBAHAN)}) AS sudah, ` +
    `(SELECT count(*) FROM pengaturan WHERE kunci = ${kutip(PENANDA)}) AS awal, ` +
    `(SELECT group_concat(x, ', ') FROM (SELECT kode AS x FROM kejadian WHERE kode IN (${daftarKutip(kodeTambahan(bank))}) ` +
    `UNION ALL SELECT id FROM rujukan WHERE id IN (${daftarKutip(idRujukanTambahan(bank))}) ` +
    `UNION ALL SELECT nama FROM paket WHERE nama IN (${daftarKutip(namaPaketTambahan(bank))}))) AS ada;`
  );
}

/**
 * Baris pertama hasil kueri dari keluaran "wrangler d1 execute --json", atau null bila tidak terbaca.
 * Keluaran dibaca sebagai JSON; yang diambil objek pertama yang memiliki larik results.
 */
export function barisStatus(keluaran) {
  if (typeof keluaran !== "string") return null;
  let data;
  try {
    data = JSON.parse(keluaran);
  } catch {
    return null;
  }
  for (const x of Array.isArray(data) ? data : [data]) {
    if (rekaman(x) && Array.isArray(x.results)) return rekaman(x.results[0]) ? x.results[0] : null;
  }
  return null;
}

const PESAN_TIDAK_TERBACA = "Status semai tambahan tidak terbaca. Lihat daftar kejadian di konsol untuk memastikan K-17 sampai K-40 sudah ada.";

/** Pesan status semai tambahan (P-17, tabel teks): { teks, peringatan }. */
export function pesanStatusTambahan(baris, bank) {
  const tidakTerbaca = { teks: PESAN_TIDAK_TERBACA, peringatan: true };
  if (!rekaman(baris)) return tidakTerbaca;
  const sudah = Number(baris.sudah);
  const awal = Number(baris.awal);
  if (!Number.isInteger(sudah) || !Number.isInteger(awal)) return tidakTerbaca;
  if (sudah > 0) {
    return {
      teks: `Semai tambahan selesai. Kejadian tambahan (${bank.rujukan.length} rujukan, ${bank.kejadian.length} kejadian, ${bank.paket.length} paket) sudah ada di basis data ini; baris yang sudah ada tidak pernah ditimpa.`,
      peringatan: false,
    };
  }
  if (awal === 0) return { teks: "Semai tambahan ditunda: bank awal belum disemai di basis data ini.", peringatan: true };
  const ada = new Set(teks(baris.ada) && baris.ada !== "" ? baris.ada.split(", ") : []);
  const bentrok = [...kodeTambahan(bank), ...idRujukanTambahan(bank), ...namaPaketTambahan(bank)].filter((x) => ada.has(x));
  if (bentrok.length === 0) return tidakTerbaca;
  return {
    teks: `Semai tambahan ditunda: ${bentrok.join(", ")} sudah ada di basis data ini. Hapus di konsol bila itu hanya percobaan; deploy berikutnya akan mencoba lagi.`,
    peringatan: true,
  };
}

/**
 * Baris yang dicetak untuk sebuah pesan status; peringatan diberi awalan GitHub Actions bila perlu (P-18).
 * @param {{ teks: string, peringatan: boolean }} pesan
 * @param {Readonly<Record<string, string | undefined>>} [lingkungan]
 */
export function barisCetakStatus(pesan, lingkungan = process.env) {
  return pesan.peringatan && lingkungan.GITHUB_ACTIONS === "true" ? `::warning title=Semai tambahan::${pesan.teks}` : pesan.teks;
}

/** Teks JSONC tanpa komentar // dan /* … *\/ (isi teks berkutip dibiarkan utuh). */
export function buangKomentar(jsonc) {
  let hasil = "";
  let i = 0;
  while (i < jsonc.length) {
    const c = jsonc[i];
    if (c === '"') {
      let j = i + 1;
      while (j < jsonc.length && jsonc[j] !== '"') j += jsonc[j] === "\\" ? 2 : 1;
      hasil += jsonc.slice(i, j + 1);
      i = j + 1;
    } else if (c === "/" && jsonc[i + 1] === "/") {
      while (i < jsonc.length && jsonc[i] !== "\n") i++;
    } else if (c === "/" && jsonc[i + 1] === "*") {
      const akhir = jsonc.indexOf("*/", i + 2);
      i = akhir < 0 ? jsonc.length : akhir + 2;
    } else {
      hasil += c;
      i++;
    }
  }
  return hasil;
}

/** Benar bila konfigurasi wrangler (JSONC) memuat kunci d1_databases di luar komentar. */
export function adaD1(isiWrangler) {
  return /"d1_databases"\s*:/.test(buangKomentar(isiWrangler));
}

/** Argumen wrangler untuk menjalankan berkas SQL; --local ditambahkan bila tidak ada --local atau --remote. */
export function argumenWrangler(berkasSql, bendera) {
  const lokasi = bendera.includes("--local") || bendera.includes("--remote") ? [] : ["--local"];
  return ["d1", "execute", BINDING_D1, "--config", JALUR_WRANGLER, "--file", berkasSql, "--yes", ...lokasi, ...bendera];
}

/** Argumen wrangler untuk kueri status semai tambahan (P-17 langkah 4), dengan lokasi dan bendera yang sama. */
export function argumenStatusWrangler(kueri, bendera) {
  const lokasi = bendera.includes("--local") || bendera.includes("--remote") ? [] : ["--local"];
  return ["d1", "execute", BINDING_D1, "--config", JALUR_WRANGLER, "--command", kueri, "--json", "--yes", ...lokasi, ...bendera];
}

function muatBank() {
  const jalur = join(AKAR, JALUR_BANK);
  if (!existsSync(jalur)) throw new Error(`Bank awal tidak ditemukan: ${JALUR_BANK}.`);
  try {
    return bacaBank(readFileSync(jalur, "utf8"));
  } catch (galat) {
    throw new Error(`Bank awal tidak sah: ${galat.message}. Jalankan content:check:jejak untuk rinciannya.`, { cause: galat });
  }
}

/** Bank tambahan bila berkasnya ada, atau null; melempar Error berisi pesan "Bank tambahan tidak sah" (P-17 langkah 2). */
function muatTambahan() {
  const jalur = join(AKAR, JALUR_TAMBAHAN);
  if (!existsSync(jalur)) return null;
  try {
    return bacaBank(readFileSync(jalur, "utf8"));
  } catch (galat) {
    throw new Error(`Bank tambahan tidak sah: ${galat.message}. Jalankan content:check:jejak untuk rinciannya.`, { cause: galat });
  }
}

function jalankan(bendera) {
  const bank = muatBank();
  if (!adaD1(readFileSync(join(AKAR, JALUR_WRANGLER), "utf8"))) {
    console.log(PESAN_BELUM);
    return 0;
  }
  const wrangler = join(AKAR, "node_modules/wrangler/bin/wrangler.js");
  if (!existsSync(wrangler)) {
    console.error("wrangler belum terpasang. Pasang dependensi lebih dulu (npx pnpm@11.25.0 install).");
    return 1;
  }
  // P-17a: bila dilewati, bank tambahan tidak dibaca sama sekali, jadi perintahnya sama dengan JS-05.
  const lewati = tambahanDilewati();
  const tambahan = lewati ? null : muatTambahan();
  const folder = mkdtempSync(join(tmpdir(), "jejak-semai-"));
  try {
    const berkas = join(folder, "semai.sql");
    writeFileSync(berkas, teksSql(bank) + (tambahan ? teksSqlTambahan(tambahan) : ""), "utf8");
    const hasil = spawnSync(process.execPath, [wrangler, ...argumenWrangler(berkas, bendera)], { cwd: AKAR, stdio: "inherit" });
    if (hasil.status !== 0) {
      console.error(`Semai gagal (kode keluar ${hasil.status ?? "tidak ada"}). Lihat pesan wrangler di atas.`);
      return hasil.status || 1;
    }
    console.log(`Semai selesai. Bank awal (${bank.rujukan.length} rujukan, ${bank.kejadian.length} kejadian, ${bank.paket.length} paket) hanya ditulis bila basis data ini belum pernah disemai.`);
    if (tambahan) {
      // Status hanya diberitakan; kode keluar tetap 0 apa pun hasilnya (P-17 langkah 5, KT-B16a).
      const status = spawnSync(process.execPath, [wrangler, ...argumenStatusWrangler(sqlStatusTambahan(tambahan), bendera)], {
        cwd: AKAR,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 16 * 1024 * 1024,
      });
      const baris = status.status === 0 ? barisStatus(status.stdout) : null;
      console.log(barisCetakStatus(pesanStatusTambahan(baris, tambahan)));
    } else if (lewati && existsSync(join(AKAR, JALUR_TAMBAHAN))) {
      console.log(PESAN_TAMBAHAN_DILEWATI);
    }
    return 0;
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

/** Titik masuk; mengembalikan kode keluar. */
export function utama(argumen) {
  try {
    if (argumen.length === 1 && argumen[0] === "--sql") {
      const sql = teksSql(muatBank());
      // Pembaca keluaran boleh berhenti lebih awal (misalnya "| more"); itu bukan galat.
      process.stdout.on("error", (galat) => {
        if (galat.code !== "EPIPE") throw galat;
        process.exit(0);
      });
      process.stdout.write(sql);
      return 0;
    }
    if (argumen[0] === "--jalankan" && (argumen.length === 1 || argumen[1] === "--")) return jalankan(argumen.slice(2));
    console.error(PESAN_PAKAI);
    return 1;
  } catch (galat) {
    console.error(galat.message);
    return 1;
  }
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  process.exitCode = utama(process.argv.slice(2));
}
