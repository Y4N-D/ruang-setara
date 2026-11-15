// Sambungan layar kelas (spesifikasi JS-10, P-12, P-13, P-15): tiket, WebSocket, sambung ulang dengan jeda yang makin
// panjang, dan keadaan layar yang disusun dari pesan server. `terapkanPesan` murni dan diuji di Node.
import { useCallback, useEffect, useRef, useState } from "react";
import { PROTOKOL_VERSI } from "../../inti/protokol";
import { skemaServerKelas, type PesanKelas, type PesanServerKelas } from "../../inti/protokol-kelas";
import { api, type GalatApi } from "../api";
import { BATAS_PUTUS_MS, jedaSambungUlang, putusanTutup } from "./tampilan-kelas";

type Pesan<T extends PesanServerKelas["t"]> = Extract<PesanServerKelas, { t: T }>;

export interface DataKelas {
  info: Pesan<"info_kelas"> | null;
  status: Pesan<"status_ruang"> | null;
  lobi: Pesan<"lobi">["pemain"];
  papan: Pesan<"papan"> | null;
  kemajuan: Pesan<"kemajuan"> | null;
  dunia: Pesan<"dunia_kelas"> | null;
  bahas: Record<string, Pesan<"data_pembahasan">>;
  /** Jam server dikurangi jam peramban (ms), dari `waktuServer` dan `w` (P-17). */
  selisih: number;
}

export const DATA_KOSONG: DataKelas = { info: null, status: null, lobi: [], papan: null, kemajuan: null, dunia: null, bahas: {}, selisih: 0 };

export type KeadaanSambungan = "menyambung" | "tersambung" | "menyambungUlang" | "terputus" | "diganti" | "ditutup" | "tidakAda";

/** Menerapkan satu pesan server ke data layar kelas. */
export function terapkanPesan(d: DataKelas, p: PesanServerKelas, sekarang: number): DataKelas {
  switch (p.t) {
    case "info_kelas":
      return { ...d, info: p, selisih: p.waktuServer - sekarang };
    case "status_ruang":
      return { ...d, status: p };
    case "lobi":
      return { ...d, lobi: p.pemain };
    case "papan":
      return { ...d, papan: p };
    case "kemajuan":
      return { ...d, kemajuan: p };
    case "dunia_kelas":
      return { ...d, dunia: p, selisih: p.w - sekarang };
    case "data_pembahasan":
      return { ...d, bahas: { ...d.bahas, [p.kejadianId]: p } };
    default:
      return d;
  }
}

/** Sambungan layar kelas untuk satu ruang. */
export function useSambunganKelas(ruangId: string, galatSesi: (galat: GalatApi) => boolean) {
  const [data, setData] = useState<DataKelas>(DATA_KOSONG);
  const [sambungan, setSambungan] = useState<KeadaanSambungan>("menyambung");
  const ws = useRef<WebSocket | null>(null);
  const pewaktu = useRef<ReturnType<typeof setTimeout> | null>(null);
  const percobaan = useRef(0);
  const gagalSejak = useRef<number | null>(null);
  const aktif = useRef(true);
  const [putaran, setPutaran] = useState(0);

  useEffect(() => {
    aktif.current = true;
    const jadwalUlang = () => {
      if (!aktif.current) return;
      const sekarang = Date.now();
      if (gagalSejak.current === null) gagalSejak.current = sekarang;
      if (sekarang - gagalSejak.current >= BATAS_PUTUS_MS) {
        setSambungan("terputus");
        return;
      }
      setSambungan("menyambungUlang");
      pewaktu.current = setTimeout(() => void sambung(), jedaSambungUlang(percobaan.current++));
    };
    const sambung = async () => {
      if (!aktif.current) return;
      const tiket = await api.tiketRuang(ruangId);
      if (!aktif.current) return;
      if (!tiket.ok) {
        if (galatSesi(tiket)) return;
        if (tiket.status === 403 || tiket.status === 404) setSambungan("tidakAda");
        else jadwalUlang();
        return;
      }
      const skema = window.location.protocol === "https:" ? "wss" : "ws";
      const s = new WebSocket(`${skema}://${window.location.host}/ws/kelas/${ruangId}?tiket=${encodeURIComponent(tiket.data.tiket)}`);
      ws.current = s;
      s.onopen = () => {
        s.send(JSON.stringify({ v: PROTOKOL_VERSI, t: "halo", peran: "guru" }));
        percobaan.current = 0;
        gagalSejak.current = null;
        setSambungan("tersambung");
      };
      s.onmessage = (e) => {
        let json: unknown;
        try {
          json = JSON.parse(String(e.data));
        } catch {
          return;
        }
        const hasil = skemaServerKelas.safeParse(json);
        if (hasil.success) setData((d) => terapkanPesan(d, hasil.data, Date.now()));
      };
      s.onclose = (e) => {
        if (ws.current === s) ws.current = null;
        if (!aktif.current) return;
        const putusan = putusanTutup(e.code);
        if (putusan === "ditutup") setSambungan("ditutup");
        else if (putusan === "diganti") setSambungan("diganti");
        else jadwalUlang();
      };
    };
    void sambung();
    return () => {
      aktif.current = false;
      if (pewaktu.current) clearTimeout(pewaktu.current);
      ws.current?.close(1000, "selesai");
      ws.current = null;
    };
  }, [ruangId, galatSesi, putaran]);

  const kirim = useCallback((pesan: PesanKelas) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(pesan));
  }, []);
  /** "Coba lagi" dan "Pakai tab ini": mulai sambungan baru dari awal. */
  const ulangi = useCallback(() => {
    percobaan.current = 0;
    gagalSejak.current = null;
    setSambungan("menyambung");
    setPutaran((p) => p + 1);
  }, []);
  return { data, sambungan, kirim, ulangi };
}
