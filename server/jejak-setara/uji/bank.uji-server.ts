// Alur penuh bank kejadian di Worker lokal sungguhan (spesifikasi JS-12; AC-1, AC-9, AC-11 sampai AC-14): guru bertanda
// Peninjau membuat dan mengajukan kejadian serta memverifikasi rujukannya, admin menerbitkan dan menyusun paket, lalu
// dialog ruang baru membolehkan ruang biasa dari paket itu. Bank awal tidak diterbitkan, agar uji lain tidak terpengaruh.
import { describe, expect, it } from "vitest";
import { alamat, d1, konsol } from "./bantuan";

const B = alamat();
const IP = "10.9.70.7";
const tajuk = (cookie = "") => ({ "X-Jejak": "1", Origin: B, "Content-Type": "application/json", "CF-Connecting-IP": IP, ...(cookie ? { Cookie: cookie } : {}) });
const cookieDari = (j: Response) => (j.headers.get("set-cookie") ?? "").split(";")[0];

async function minta(cookie: string, metode: string, jalur: string, isi?: unknown) {
  const j = await fetch(`${B}${jalur}`, { method: metode, headers: tajuk(cookie), ...(isi === undefined ? {} : { body: JSON.stringify(isi) }) });
  const teks = await j.text();
  return { status: j.status, isi: (teks ? JSON.parse(teks) : {}) as Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

describe("alur bank sampai ruang biasa", () => {
  it("guru Peninjau membuat, mengajukan, dan memverifikasi; admin menerbitkan, menyusun paket, dan membuat ruang biasa", async () => {
    const email = `peninjau-${Date.now()}@sekolah.sch.id`;
    const akun = await konsol("POST", "/api/akun", { email, namaTampilan: "Pak Wayan", peran: "guru", peninjau: true });
    expect(akun.status).toBe(201);
    const s1 = cookieDari(await fetch(`${B}/api/masuk`, { method: "POST", headers: tajuk(), body: JSON.stringify({ email, sandi: akun.isi.sandiSementara }) }));
    const guru = cookieDari(await fetch(`${B}/api/sandi`, { method: "POST", headers: tajuk(s1), body: JSON.stringify({ sandiBaru: "kalimat sandi peninjau" }) }));
    expect(guru).not.toBe("");

    // Guru membuat kejadian dari isi K-01 yang diubah judulnya (P-7).
    const k01 = await minta(guru, "GET", "/api/kejadian/K-01");
    expect(k01.status).toBe(200);
    expect(k01.isi.bolehSunting).toBe(false);
    const baru = await minta(guru, "POST", "/api/kejadian", { isi: { ...k01.isi.kerja.isi, judul: "Kejadian uji server" } });
    expect(baru.status).toBe(201);
    const kode = baru.isi.kode as string;
    expect(kode).toMatch(/^K-\d{2,3}$/);
    expect((await minta(guru, "POST", `/api/kejadian/${kode}/aksi`, { aksi: "ajukan" })).isi.status).toBe("tinjau");
    expect((await minta(guru, "POST", `/api/kejadian/${kode}/aksi`, { aksi: "terbitkan", catatan: "x" })).status).toBe(403);

    // Peninjau memverifikasi rujukannya (P-19); admin tanpa tanda Peninjau tidak bisa.
    const rujukan = k01.isi.kerja.isi.kartu.rujukan as string[];
    expect((await konsol("POST", `/api/rujukan/${rujukan[0]}/verifikasi`, { terverifikasi: true })).status).toBe(403);
    for (const id of rujukan) expect((await minta(guru, "POST", `/api/rujukan/${id}/verifikasi`, { terverifikasi: true })).isi.rujukan.diverifikasiOleh).toBe("Pak Wayan");

    // Admin menerbitkan (P-13, P-14).
    const terbit = await konsol("POST", `/api/kejadian/${kode}/aksi`, { aksi: "terbitkan", catatan: "Terbit pertama" });
    expect(terbit.isi).toEqual({ kode, status: "terbit", nomor: 1 });

    // Admin menyusun paket dari kejadian terbit; paket siap untuk ruang biasa (P-22).
    const paket = await konsol("POST", "/api/paket", { nama: `Paket uji server ${Date.now()}`, deskripsi: "Satu kejadian terbit.", aktif: true, kejadian: [kode] });
    expect(paket.status).toBe(201);
    const paketId = paket.isi.id as string;
    const pilihan = await konsol("GET", "/api/ruang/pilihan");
    const p = (pilihan.isi.paket as { id: string; siapRuangBiasa: boolean }[]).find((x) => x.id === paketId);
    expect(p?.siapRuangBiasa).toBe(true);

    // Ruang biasa dari paket itu (AC-13).
    const ruang = await konsol("POST", "/api/ruang", { labelKelas: "IX C", paketId, durasiMenit: 10, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: false });
    expect(ruang.status).toBe(201);
    expect((ruang.isi.ruang as { uji: boolean }).uji).toBe(false);
    expect((await konsol("POST", `/api/ruang/${(ruang.isi.ruang as { id: string }).id}/kelola`, { aksi: "tutup" })).status).toBe(200);

    // Audit (P-25): setiap aksi tercatat tanpa isi kejadian.
    const audit = d1<{ aksi: string; rincian_json: string }>(`SELECT aksi, rincian_json FROM log_audit WHERE sasaran = '${kode}' ORDER BY waktu`);
    expect(audit.map((a) => a.aksi)).toEqual(["kejadian.buat", "kejadian.ajukan", "kejadian.terbitkan"]);
    expect(audit.every((a) => !a.rincian_json.includes("Kejadian uji server"))).toBe(true);
  }, 60_000);
});
