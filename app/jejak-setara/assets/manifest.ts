// Dibuat build_jejak.py. Jangan disunting manual.
// Satu-satunya pintu masuk aset gambar Jejak Setara (Architecture 11.2; Permintaan C-6; usulan 11a JS-07),
// hanya untuk aset berstatus Disetujui di docs/jejak-setara/Daftar_Aset.md (sama dengan CREDITS.md).
// Setiap PNG diimpor sebagai URL berkas lewat Vite, seperti manifest Sehari Setara. Berkas ini tidak
// mengimpor apa pun dari inti/, karena hanya dipakai klien. Untuk mengubahnya, ubah kode gambar atau daftar
// aset di scripts/game/art/, lalu jalankan npx pnpm@11.25.0 assets:build:jejak. Isinya diperiksa ulang oleh
// app/jejak-setara/__tests__/konten/aset-manifest.test.ts.

import ava1AtasDiam from "./ava/ava_1_atas_diam.png";
import ava1AtasJalan from "./ava/ava_1_atas_jalan.png";
import ava1BawahDiam from "./ava/ava_1_bawah_diam.png";
import ava1BawahJalan from "./ava/ava_1_bawah_jalan.png";
import ava1KananDiam from "./ava/ava_1_kanan_diam.png";
import ava1KananJalan from "./ava/ava_1_kanan_jalan.png";
import ava2AtasDiam from "./ava/ava_2_atas_diam.png";
import ava2AtasJalan from "./ava/ava_2_atas_jalan.png";
import ava2BawahDiam from "./ava/ava_2_bawah_diam.png";
import ava2BawahJalan from "./ava/ava_2_bawah_jalan.png";
import ava2KananDiam from "./ava/ava_2_kanan_diam.png";
import ava2KananJalan from "./ava/ava_2_kanan_jalan.png";
import ava3AtasDiam from "./ava/ava_3_atas_diam.png";
import ava3AtasJalan from "./ava/ava_3_atas_jalan.png";
import ava3BawahDiam from "./ava/ava_3_bawah_diam.png";
import ava3BawahJalan from "./ava/ava_3_bawah_jalan.png";
import ava3KananDiam from "./ava/ava_3_kanan_diam.png";
import ava3KananJalan from "./ava/ava_3_kanan_jalan.png";
import ava4AtasDiam from "./ava/ava_4_atas_diam.png";
import ava4AtasJalan from "./ava/ava_4_atas_jalan.png";
import ava4BawahDiam from "./ava/ava_4_bawah_diam.png";
import ava4BawahJalan from "./ava/ava_4_bawah_jalan.png";
import ava4KananDiam from "./ava/ava_4_kanan_diam.png";
import ava4KananJalan from "./ava/ava_4_kanan_jalan.png";
import ava5AtasDiam from "./ava/ava_5_atas_diam.png";
import ava5AtasJalan from "./ava/ava_5_atas_jalan.png";
import ava5BawahDiam from "./ava/ava_5_bawah_diam.png";
import ava5BawahJalan from "./ava/ava_5_bawah_jalan.png";
import ava5KananDiam from "./ava/ava_5_kanan_diam.png";
import ava5KananJalan from "./ava/ava_5_kanan_jalan.png";
import ava6AtasDiam from "./ava/ava_6_atas_diam.png";
import ava6AtasJalan from "./ava/ava_6_atas_jalan.png";
import ava6BawahDiam from "./ava/ava_6_bawah_diam.png";
import ava6BawahJalan from "./ava/ava_6_bawah_jalan.png";
import ava6KananDiam from "./ava/ava_6_kanan_diam.png";
import ava6KananJalan from "./ava/ava_6_kanan_jalan.png";
import ava7AtasDiam from "./ava/ava_7_atas_diam.png";
import ava7AtasJalan from "./ava/ava_7_atas_jalan.png";
import ava7BawahDiam from "./ava/ava_7_bawah_diam.png";
import ava7BawahJalan from "./ava/ava_7_bawah_jalan.png";
import ava7KananDiam from "./ava/ava_7_kanan_diam.png";
import ava7KananJalan from "./ava/ava_7_kanan_jalan.png";
import ava8AtasDiam from "./ava/ava_8_atas_diam.png";
import ava8AtasJalan from "./ava/ava_8_atas_jalan.png";
import ava8BawahDiam from "./ava/ava_8_bawah_diam.png";
import ava8BawahJalan from "./ava/ava_8_bawah_jalan.png";
import ava8KananDiam from "./ava/ava_8_kanan_diam.png";
import ava8KananJalan from "./ava/ava_8_kanan_jalan.png";

import ikonArsip from "./ikon/ikon_arsip.png";
import ikonAva1 from "./ikon/ikon_ava_1.png";
import ikonAva2 from "./ikon/ikon_ava_2.png";
import ikonAva3 from "./ikon/ikon_ava_3.png";
import ikonAva4 from "./ikon/ikon_ava_4.png";
import ikonAva5 from "./ikon/ikon_ava_5.png";
import ikonAva6 from "./ikon/ikon_ava_6.png";
import ikonAva7 from "./ikon/ikon_ava_7.png";
import ikonAva8 from "./ikon/ikon_ava_8.png";
import ikonBintang from "./ikon/ikon_bintang.png";
import ikonBulan from "./ikon/ikon_bulan.png";
import ikonCentang from "./ikon/ikon_centang.png";
import ikonEmosiHati from "./ikon/ikon_emosi_hati.png";
import ikonEmosiKeringat from "./ikon/ikon_emosi_keringat.png";
import ikonEmosiSeru from "./ikon/ikon_emosi_seru.png";
import ikonEmosiTanya from "./ikon/ikon_emosi_tanya.png";
import ikonJam from "./ikon/ikon_jam.png";
import ikonJejak from "./ikon/ikon_jejak.png";
import ikonKarcis from "./ikon/ikon_karcis.png";
import ikonKompas from "./ikon/ikon_kompas.png";
import ikonLari from "./ikon/ikon_lari.png";
import ikonLayarPenuh from "./ikon/ikon_layar_penuh.png";
import ikonMatahari from "./ikon/ikon_matahari.png";
import ikonMenyambung from "./ikon/ikon_menyambung.png";
import ikonMiniHalte from "./ikon/ikon_mini_halte.png";
import ikonMiniKejadian from "./ikon/ikon_mini_kejadian.png";
import ikonMiniSelesai from "./ikon/ikon_mini_selesai.png";
import ikonPeringatan from "./ikon/ikon_peringatan.png";
import ikonPetunjuk from "./ikon/ikon_petunjuk.png";
import ikonPutarHp from "./ikon/ikon_putar_hp.png";
import ikonSuaraMati from "./ikon/ikon_suara_mati.png";
import ikonSuaraNyala from "./ikon/ikon_suara_nyala.png";
import ikonTeropong from "./ikon/ikon_teropong.png";
import ikonZona1 from "./ikon/ikon_zona_1.png";
import ikonZona2 from "./ikon/ikon_zona_2.png";
import ikonZona3 from "./ikon/ikon_zona_3.png";
import ikonZona4 from "./ikon/ikon_zona_4.png";
import ikonZona5 from "./ikon/ikon_zona_5.png";
import ikonZona6 from "./ikon/ikon_zona_6.png";
import ikonZona7 from "./ikon/ikon_zona_7.png";
import ikonZona8 from "./ikon/ikon_zona_8.png";
import tandaDebu from "./ikon/tanda_debu.png";
import tandaDibuka from "./ikon/tanda_dibuka.png";
import tandaDiri from "./ikon/tanda_diri.png";
import tandaKejadian from "./ikon/tanda_kejadian.png";
import tandaKilau from "./ikon/tanda_kilau.png";
import tandaKompas from "./ikon/tanda_kompas.png";
import tandaKotakBuku from "./ikon/tanda_kotak_buku.png";
import tandaKotakKarcis from "./ikon/tanda_kotak_karcis.png";
import tandaKotakKompas from "./ikon/tanda_kotak_kompas.png";
import tandaKotakSepatu from "./ikon/tanda_kotak_sepatu.png";
import tandaKotakTeropong from "./ikon/tanda_kotak_teropong.png";
import tandaSelesai from "./ikon/tanda_selesai.png";

import npcAnak1BawahDiam from "./npc/npc_anak1_bawah_diam.png";
import npcAnak2BawahDiam from "./npc/npc_anak2_bawah_diam.png";
import npcBayuBawahDiam from "./npc/npc_bayu_bawah_diam.png";
import npcDimasBawahDiam from "./npc/npc_dimas_bawah_diam.png";
import npcDimasKananMotor from "./npc/npc_dimas_kanan_motor.png";
import npcGitaBawahDiam from "./npc/npc_gita_bawah_diam.png";
import npcIbuBawahDiam from "./npc/npc_ibu_bawah_diam.png";
import npcIbubayiBawahDiam from "./npc/npc_ibubayi_bawah_diam.png";
import npcKomangBawahDiam from "./npc/npc_komang_bawah_diam.png";
import npcKomangBawahMenunduk from "./npc/npc_komang_bawah_menunduk.png";
import npcMadeBawahDiam from "./npc/npc_made_bawah_diam.png";
import npcNaraBawahDiam from "./npc/npc_nara_bawah_diam.png";
import npcNenekBawahDiam from "./npc/npc_nenek_bawah_diam.png";
import npcPedagangBawahDiam from "./npc/npc_pedagang_bawah_diam.png";
import npcPetugasBawahDiam from "./npc/npc_petugas_bawah_diam.png";
import npcPolisiBawahDiam from "./npc/npc_polisi_bawah_diam.png";
import npcRakaBawahKursiroda from "./npc/npc_raka_bawah_kursiroda.png";
import npcRatihBawahDiam from "./npc/npc_ratih_bawah_diam.png";
import npcSintaBawahDiam from "./npc/npc_sinta_bawah_diam.png";
import npcSiswa1BawahDiam from "./npc/npc_siswa1_bawah_diam.png";
import npcSiswa1BawahHp from "./npc/npc_siswa1_bawah_hp.png";
import npcSiswa2BawahDiam from "./npc/npc_siswa2_bawah_diam.png";
import npcSiswa2BawahMenunduk from "./npc/npc_siswa2_bawah_menunduk.png";
import npcSiswa3BawahDiam from "./npc/npc_siswa3_bawah_diam.png";
import npcSiswa4BawahDiam from "./npc/npc_siswa4_bawah_diam.png";
import npcSiswa5BawahDiam from "./npc/npc_siswa5_bawah_diam.png";
import npcSiswa5BawahHp from "./npc/npc_siswa5_bawah_hp.png";
import npcSiswa6BawahDiam from "./npc/npc_siswa6_bawah_diam.png";
import npcWarga1BawahDiam from "./npc/npc_warga1_bawah_diam.png";
import npcWarga1BawahMenunjuk from "./npc/npc_warga1_bawah_menunjuk.png";
import npcWarga2BawahDiam from "./npc/npc_warga2_bawah_diam.png";
import npcWarga3BawahDiam from "./npc/npc_warga3_bawah_diam.png";
import npcWayanBawahDiam from "./npc/npc_wayan_bawah_diam.png";

import objAngkot from "./obj/obj_angkot.png";
import objAngkotAtas from "./obj/obj_angkot_atas.png";
import objBale from "./obj/obj_bale.png";
import objBaleAtas from "./obj/obj_bale_atas.png";
import objBangku from "./obj/obj_bangku.png";
import objBangkuAntrean from "./obj/obj_bangku_antrean.png";
import objBangkuPasar from "./obj/obj_bangku_pasar.png";
import objBatu from "./obj/obj_batu.png";
import objBola from "./obj/obj_bola.png";
import objDompet from "./obj/obj_dompet.png";
import objGerbangBuka from "./obj/obj_gerbang_buka.png";
import objGerbangBukaAtas from "./obj/obj_gerbang_buka_atas.png";
import objGerbangTutup from "./obj/obj_gerbang_tutup.png";
import objGerbangTutupAtas from "./obj/obj_gerbang_tutup_atas.png";
import objGerobak from "./obj/obj_gerobak.png";
import objGerobakAtas from "./obj/obj_gerobak_atas.png";
import objHalte from "./obj/obj_halte.png";
import objHalteAtas from "./obj/obj_halte_atas.png";
import objJembatanDatar from "./obj/obj_jembatan_datar.png";
import objJembatanTegak from "./obj/obj_jembatan_tegak.png";
import objKantin from "./obj/obj_kantin.png";
import objKantinAtas from "./obj/obj_kantin_atas.png";
import objKantorDesa from "./obj/obj_kantor_desa.png";
import objKantorDesaAtas from "./obj/obj_kantor_desa_atas.png";
import objKelapa from "./obj/obj_kelapa.png";
import objKelapaAtas from "./obj/obj_kelapa_atas.png";
import objKotakBekal from "./obj/obj_kotak_bekal.png";
import objKursiRoda from "./obj/obj_kursi_roda.png";
import objLapak from "./obj/obj_lapak.png";
import objLos from "./obj/obj_los.png";
import objLosAtas from "./obj/obj_los_atas.png";
import objMejaPanitia from "./obj/obj_meja_panitia.png";
import objMotor from "./obj/obj_motor.png";
import objPagarBambuDatar from "./obj/obj_pagar_bambu_datar.png";
import objPagarBambuSudutAtasKanan from "./obj/obj_pagar_bambu_sudut_atas_kanan.png";
import objPagarBambuSudutAtasKiri from "./obj/obj_pagar_bambu_sudut_atas_kiri.png";
import objPagarBambuSudutBawahKanan from "./obj/obj_pagar_bambu_sudut_bawah_kanan.png";
import objPagarBambuSudutBawahKiri from "./obj/obj_pagar_bambu_sudut_bawah_kiri.png";
import objPagarBambuTegak from "./obj/obj_pagar_bambu_tegak.png";
import objPagarBambuUjungKanan from "./obj/obj_pagar_bambu_ujung_kanan.png";
import objPagarBambuUjungKiri from "./obj/obj_pagar_bambu_ujung_kiri.png";
import objPagarSekolahDatar from "./obj/obj_pagar_sekolah_datar.png";
import objPagarSekolahSudutAtasKanan from "./obj/obj_pagar_sekolah_sudut_atas_kanan.png";
import objPagarSekolahSudutAtasKiri from "./obj/obj_pagar_sekolah_sudut_atas_kiri.png";
import objPagarSekolahSudutBawahKanan from "./obj/obj_pagar_sekolah_sudut_bawah_kanan.png";
import objPagarSekolahSudutBawahKiri from "./obj/obj_pagar_sekolah_sudut_bawah_kiri.png";
import objPagarSekolahTegak from "./obj/obj_pagar_sekolah_tegak.png";
import objPagarSekolahUjungKanan from "./obj/obj_pagar_sekolah_ujung_kanan.png";
import objPagarSekolahUjungKiri from "./obj/obj_pagar_sekolah_ujung_kiri.png";
import objPengerasSuara from "./obj/obj_pengeras_suara.png";
import objPisang from "./obj/obj_pisang.png";
import objPisangAtas from "./obj/obj_pisang_atas.png";
import objPohon from "./obj/obj_pohon.png";
import objPohonAtas from "./obj/obj_pohon_atas.png";
import objPohonB from "./obj/obj_pohon_b.png";
import objPohonBAtas from "./obj/obj_pohon_b_atas.png";
import objPohonC from "./obj/obj_pohon_c.png";
import objPohonCAtas from "./obj/obj_pohon_c_atas.png";
import objPohonKecil from "./obj/obj_pohon_kecil.png";
import objPohonKecilAtas from "./obj/obj_pohon_kecil_atas.png";
import objPosKeamanan from "./obj/obj_pos_keamanan.png";
import objPosKeamananAtas from "./obj/obj_pos_keamanan_atas.png";
import objPosRonda from "./obj/obj_pos_ronda.png";
import objPosRondaAtas from "./obj/obj_pos_ronda_atas.png";
import objPotTanaman from "./obj/obj_pot_tanaman.png";
import objPuskesmas from "./obj/obj_puskesmas.png";
import objPuskesmasAtas from "./obj/obj_puskesmas_atas.png";
import objRambuHalte from "./obj/obj_rambu_halte.png";
import objRambuHalteAtas from "./obj/obj_rambu_halte_atas.png";
import objRambuSeberang from "./obj/obj_rambu_seberang.png";
import objRambuSeberangAtas from "./obj/obj_rambu_seberang_atas.png";
import objRumahA from "./obj/obj_rumah_a.png";
import objRumahAAtas from "./obj/obj_rumah_a_atas.png";
import objRumahB from "./obj/obj_rumah_b.png";
import objRumahBAtas from "./obj/obj_rumah_b_atas.png";
import objRumahC from "./obj/obj_rumah_c.png";
import objRumahCAtas from "./obj/obj_rumah_c_atas.png";
import objRumahD from "./obj/obj_rumah_d.png";
import objRumahDAtas from "./obj/obj_rumah_d_atas.png";
import objRumahNara from "./obj/obj_rumah_nara.png";
import objRumahNaraAtas from "./obj/obj_rumah_nara_atas.png";
import objSekolah from "./obj/obj_sekolah.png";
import objSekolahAtas from "./obj/obj_sekolah_atas.png";
import objSemak from "./obj/obj_semak.png";
import objSemakB from "./obj/obj_semak_b.png";
import objSisaPiknik from "./obj/obj_sisa_piknik.png";
import objTaliLompat from "./obj/obj_tali_lompat.png";
import objTempatSampah from "./obj/obj_tempat_sampah.png";
import objTendaA from "./obj/obj_tenda_a.png";
import objTendaAAtas from "./obj/obj_tenda_a_atas.png";
import objTendaB from "./obj/obj_tenda_b.png";
import objTendaBAtas from "./obj/obj_tenda_b_atas.png";
import objTiangBendera from "./obj/obj_tiang_bendera.png";
import objTiangBenderaAtas from "./obj/obj_tiang_bendera_atas.png";
import objTiangKamera from "./obj/obj_tiang_kamera.png";
import objTiangKameraAtas from "./obj/obj_tiang_kamera_atas.png";
import objTiangLampu from "./obj/obj_tiang_lampu.png";
import objTiangLampuAtas from "./obj/obj_tiang_lampu_atas.png";
import objWarungMade from "./obj/obj_warung_made.png";
import objWarungMadeAtas from "./obj/obj_warung_made_atas.png";
import objWarungWifi from "./obj/obj_warung_wifi.png";
import objWarungWifiAtas from "./obj/obj_warung_wifi_atas.png";

import ubinPagi from "./ubin/ubin_pagi.png";
import ubinSiang from "./ubin/ubin_siang.png";
import ubinSore from "./ubin/ubin_sore.png";

/** Satu strip mendatar: URL berkas, ukuran satu bingkai dalam piksel, dan jumlah bingkai. */
export type Gambar = { url: string; lebar: number; tinggi: number; bingkai: number };

/** Strip avatar per arah (diam 2 bingkai, jalan 4 bingkai) dan ikon kepala. Arah kiri dicerminkan dari arah kanan. */
export type GambarAvatar = {
  bawah: { diam: Gambar; jalan: Gambar };
  atas: { diam: Gambar; jalan: Gambar };
  kanan: { diam: Gambar; jalan: Gambar };
  ikon: Gambar;
};

/** Bagian bawah (lapisan 20), bagian atas (lapisan 40) atau null, dan jejak kaki dalam ubin. */
export type GambarObjek = { bawah: Gambar; atas: Gambar | null; lebar: number; tinggi: number };

/** Strip tokoh bukan pemain dan titik kakinya di dalam satu bingkai. */
export type GambarNpc = Gambar & { kakiX: number; kakiY: number };

/** Sama dengan WarnaTas di inti/tipe.ts, ditulis ulang karena manifest tidak mengimpor dari inti/. */
export type KunciWarnaTas = "sun" | "mango" | "coral" | "rose" | "berry" | "teal" | "leaf" | "sky-d";

/**
 * Lembar ubin per masa (256 × 384 piksel): ubin nomor n berada di kolom n mod 16 dan baris n div 16, dan nomornya sama
 * di ketiga masa.
 */
export const UBIN = { ukuran: 16, kolom: 16, jumlah: 377, pagi: ubinPagi, siang: ubinSiang, sore: ubinSore } as const;

/** Bingkai avatar 16 × 24 piksel dengan titik kaki (8, 21). */
export const TOKOH = { lebar: 16, tinggi: 24, kakiX: 8, kakiY: 21 } as const;

/** Avatar A1–A8 berurutan, sehingga nomor avatar di protokol (0–7) langsung menjadi indeks. */
export const AVATAR: readonly GambarAvatar[] = [
  // A1 (indeks 0)
  {
    bawah: {
      diam: { url: ava1BawahDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava1BawahJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    atas: {
      diam: { url: ava1AtasDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava1AtasJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    kanan: {
      diam: { url: ava1KananDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava1KananJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    ikon: { url: ikonAva1, lebar: 16, tinggi: 16, bingkai: 1 },
  },
  // A2 (indeks 1)
  {
    bawah: {
      diam: { url: ava2BawahDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava2BawahJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    atas: {
      diam: { url: ava2AtasDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava2AtasJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    kanan: {
      diam: { url: ava2KananDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava2KananJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    ikon: { url: ikonAva2, lebar: 16, tinggi: 16, bingkai: 1 },
  },
  // A3 (indeks 2)
  {
    bawah: {
      diam: { url: ava3BawahDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava3BawahJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    atas: {
      diam: { url: ava3AtasDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava3AtasJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    kanan: {
      diam: { url: ava3KananDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava3KananJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    ikon: { url: ikonAva3, lebar: 16, tinggi: 16, bingkai: 1 },
  },
  // A4 (indeks 3)
  {
    bawah: {
      diam: { url: ava4BawahDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava4BawahJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    atas: {
      diam: { url: ava4AtasDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava4AtasJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    kanan: {
      diam: { url: ava4KananDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava4KananJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    ikon: { url: ikonAva4, lebar: 16, tinggi: 16, bingkai: 1 },
  },
  // A5 (indeks 4)
  {
    bawah: {
      diam: { url: ava5BawahDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava5BawahJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    atas: {
      diam: { url: ava5AtasDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava5AtasJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    kanan: {
      diam: { url: ava5KananDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava5KananJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    ikon: { url: ikonAva5, lebar: 16, tinggi: 16, bingkai: 1 },
  },
  // A6 (indeks 5)
  {
    bawah: {
      diam: { url: ava6BawahDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava6BawahJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    atas: {
      diam: { url: ava6AtasDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava6AtasJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    kanan: {
      diam: { url: ava6KananDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava6KananJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    ikon: { url: ikonAva6, lebar: 16, tinggi: 16, bingkai: 1 },
  },
  // A7 (indeks 6)
  {
    bawah: {
      diam: { url: ava7BawahDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava7BawahJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    atas: {
      diam: { url: ava7AtasDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava7AtasJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    kanan: {
      diam: { url: ava7KananDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava7KananJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    ikon: { url: ikonAva7, lebar: 16, tinggi: 16, bingkai: 1 },
  },
  // A8 (indeks 7)
  {
    bawah: {
      diam: { url: ava8BawahDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava8BawahJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    atas: {
      diam: { url: ava8AtasDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava8AtasJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    kanan: {
      diam: { url: ava8KananDiam, lebar: 16, tinggi: 24, bingkai: 2 },
      jalan: { url: ava8KananJalan, lebar: 16, tinggi: 24, bingkai: 4 },
    },
    ikon: { url: ikonAva8, lebar: 16, tinggi: 16, bingkai: 1 },
  },
];

/** Warna kunci tas di gambar avatar. Antarmuka mengganti keduanya serentak saat memuat (Design System 8). */
export const KUNCI_TAS = { dasar: "#FFD23F", bayangan: "#FF9F1C" } as const;

/** Pasangan [dasar, bayangan] setiap warna tas, sesuai tabel Design System 8. */
export const WARNA_TAS: Readonly<Record<KunciWarnaTas, readonly [dasar: string, bayangan: string]>> = {
  sun: ["#FFD23F", "#FF9F1C"],
  mango: ["#FF9F1C", "#FF6B5B"],
  coral: ["#FF6B5B", "#8A5A33"],
  rose: ["#FF8FB8", "#FF6B5B"],
  berry: ["#9B5DE5", "#4A4F9C"],
  teal: ["#2EC4B6", "#3BA55C"],
  leaf: ["#8AD95B", "#3BA55C"],
  "sky-d": ["#3A86D9", "#2B3F8C"],
};

/**
 * Objek berkunci jenis di kampung.json, yaitu nama berkas tanpa awalan obj_. Bagian atas digambar di
 * piksel (16x − 1, 16y − 1) dan bagian bawah tepat di bawahnya. lebar dan tinggi adalah jejak kaki dalam
 * ubin menurut aturan JS-06: (lebar PNG − 2) / 16, dan (tinggi bagian bawah + tinggi bagian atas − 2) / 16.
 */
export const OBJEK: Readonly<Record<string, GambarObjek>> = {
  angkot: {
    bawah: { url: objAngkot, lebar: 50, tinggi: 21, bingkai: 1 },
    atas: { url: objAngkotAtas, lebar: 50, tinggi: 13, bingkai: 1 },
    lebar: 3,
    tinggi: 2,
  },
  bale: {
    bawah: { url: objBale, lebar: 82, tinggi: 35, bingkai: 1 },
    atas: { url: objBaleAtas, lebar: 82, tinggi: 31, bingkai: 1 },
    lebar: 5,
    tinggi: 4,
  },
  bangku: {
    bawah: { url: objBangku, lebar: 34, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 2,
    tinggi: 1,
  },
  bangku_antrean: {
    bawah: { url: objBangkuAntrean, lebar: 50, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 3,
    tinggi: 1,
  },
  bangku_pasar: {
    bawah: { url: objBangkuPasar, lebar: 34, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 2,
    tinggi: 1,
  },
  batu: {
    bawah: { url: objBatu, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  bola: {
    bawah: { url: objBola, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  dompet: {
    bawah: { url: objDompet, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  gerbang_buka: {
    bawah: { url: objGerbangBuka, lebar: 66, tinggi: 17, bingkai: 1 },
    atas: { url: objGerbangBukaAtas, lebar: 66, tinggi: 17, bingkai: 1 },
    lebar: 4,
    tinggi: 2,
  },
  gerbang_tutup: {
    bawah: { url: objGerbangTutup, lebar: 66, tinggi: 17, bingkai: 1 },
    atas: { url: objGerbangTutupAtas, lebar: 66, tinggi: 17, bingkai: 1 },
    lebar: 4,
    tinggi: 2,
  },
  gerobak: {
    bawah: { url: objGerobak, lebar: 34, tinggi: 21, bingkai: 1 },
    atas: { url: objGerobakAtas, lebar: 34, tinggi: 13, bingkai: 1 },
    lebar: 2,
    tinggi: 2,
  },
  halte: {
    bawah: { url: objHalte, lebar: 50, tinggi: 23, bingkai: 1 },
    atas: { url: objHalteAtas, lebar: 50, tinggi: 11, bingkai: 1 },
    lebar: 3,
    tinggi: 2,
  },
  jembatan_datar: {
    bawah: { url: objJembatanDatar, lebar: 50, tinggi: 34, bingkai: 1 },
    atas: null,
    lebar: 3,
    tinggi: 2,
  },
  jembatan_tegak: {
    bawah: { url: objJembatanTegak, lebar: 34, tinggi: 50, bingkai: 1 },
    atas: null,
    lebar: 2,
    tinggi: 3,
  },
  kantin: {
    bawah: { url: objKantin, lebar: 66, tinggi: 27, bingkai: 1 },
    atas: { url: objKantinAtas, lebar: 66, tinggi: 23, bingkai: 1 },
    lebar: 4,
    tinggi: 3,
  },
  kantor_desa: {
    bawah: { url: objKantorDesa, lebar: 98, tinggi: 35, bingkai: 1 },
    atas: { url: objKantorDesaAtas, lebar: 98, tinggi: 31, bingkai: 1 },
    lebar: 6,
    tinggi: 4,
  },
  kelapa: {
    bawah: { url: objKelapa, lebar: 50, tinggi: 31, bingkai: 1 },
    atas: { url: objKelapaAtas, lebar: 50, tinggi: 35, bingkai: 1 },
    lebar: 3,
    tinggi: 4,
  },
  kotak_bekal: {
    bawah: { url: objKotakBekal, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  kursi_roda: {
    bawah: { url: objKursiRoda, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  lapak: {
    bawah: { url: objLapak, lebar: 34, tinggi: 34, bingkai: 1 },
    atas: null,
    lebar: 2,
    tinggi: 2,
  },
  los: {
    bawah: { url: objLos, lebar: 98, tinggi: 28, bingkai: 1 },
    atas: { url: objLosAtas, lebar: 98, tinggi: 22, bingkai: 1 },
    lebar: 6,
    tinggi: 3,
  },
  meja_panitia: {
    bawah: { url: objMejaPanitia, lebar: 34, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 2,
    tinggi: 1,
  },
  motor: {
    bawah: { url: objMotor, lebar: 34, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 2,
    tinggi: 1,
  },
  pagar_bambu_datar: {
    bawah: { url: objPagarBambuDatar, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_bambu_sudut_atas_kanan: {
    bawah: { url: objPagarBambuSudutAtasKanan, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_bambu_sudut_atas_kiri: {
    bawah: { url: objPagarBambuSudutAtasKiri, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_bambu_sudut_bawah_kanan: {
    bawah: { url: objPagarBambuSudutBawahKanan, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_bambu_sudut_bawah_kiri: {
    bawah: { url: objPagarBambuSudutBawahKiri, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_bambu_tegak: {
    bawah: { url: objPagarBambuTegak, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_bambu_ujung_kanan: {
    bawah: { url: objPagarBambuUjungKanan, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_bambu_ujung_kiri: {
    bawah: { url: objPagarBambuUjungKiri, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_sekolah_datar: {
    bawah: { url: objPagarSekolahDatar, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_sekolah_sudut_atas_kanan: {
    bawah: { url: objPagarSekolahSudutAtasKanan, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_sekolah_sudut_atas_kiri: {
    bawah: { url: objPagarSekolahSudutAtasKiri, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_sekolah_sudut_bawah_kanan: {
    bawah: { url: objPagarSekolahSudutBawahKanan, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_sekolah_sudut_bawah_kiri: {
    bawah: { url: objPagarSekolahSudutBawahKiri, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_sekolah_tegak: {
    bawah: { url: objPagarSekolahTegak, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_sekolah_ujung_kanan: {
    bawah: { url: objPagarSekolahUjungKanan, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pagar_sekolah_ujung_kiri: {
    bawah: { url: objPagarSekolahUjungKiri, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pengeras_suara: {
    bawah: { url: objPengerasSuara, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  pisang: {
    bawah: { url: objPisang, lebar: 50, tinggi: 25, bingkai: 1 },
    atas: { url: objPisangAtas, lebar: 50, tinggi: 25, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  pohon: {
    bawah: { url: objPohon, lebar: 50, tinggi: 21, bingkai: 1 },
    atas: { url: objPohonAtas, lebar: 50, tinggi: 29, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  pohon_b: {
    bawah: { url: objPohonB, lebar: 50, tinggi: 21, bingkai: 1 },
    atas: { url: objPohonBAtas, lebar: 50, tinggi: 29, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  pohon_c: {
    bawah: { url: objPohonC, lebar: 50, tinggi: 21, bingkai: 1 },
    atas: { url: objPohonCAtas, lebar: 50, tinggi: 29, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  pohon_kecil: {
    bawah: { url: objPohonKecil, lebar: 18, tinggi: 17, bingkai: 1 },
    atas: { url: objPohonKecilAtas, lebar: 18, tinggi: 17, bingkai: 1 },
    lebar: 1,
    tinggi: 2,
  },
  pos_keamanan: {
    bawah: { url: objPosKeamanan, lebar: 34, tinggi: 21, bingkai: 1 },
    atas: { url: objPosKeamananAtas, lebar: 34, tinggi: 13, bingkai: 1 },
    lebar: 2,
    tinggi: 2,
  },
  pos_ronda: {
    bawah: { url: objPosRonda, lebar: 50, tinggi: 27, bingkai: 1 },
    atas: { url: objPosRondaAtas, lebar: 50, tinggi: 23, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  pot_tanaman: {
    bawah: { url: objPotTanaman, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  puskesmas: {
    bawah: { url: objPuskesmas, lebar: 98, tinggi: 35, bingkai: 1 },
    atas: { url: objPuskesmasAtas, lebar: 98, tinggi: 31, bingkai: 1 },
    lebar: 6,
    tinggi: 4,
  },
  rambu_halte: {
    bawah: { url: objRambuHalte, lebar: 18, tinggi: 17, bingkai: 1 },
    atas: { url: objRambuHalteAtas, lebar: 18, tinggi: 17, bingkai: 1 },
    lebar: 1,
    tinggi: 2,
  },
  rambu_seberang: {
    bawah: { url: objRambuSeberang, lebar: 18, tinggi: 17, bingkai: 1 },
    atas: { url: objRambuSeberangAtas, lebar: 18, tinggi: 17, bingkai: 1 },
    lebar: 1,
    tinggi: 2,
  },
  rumah_a: {
    bawah: { url: objRumahA, lebar: 66, tinggi: 32, bingkai: 1 },
    atas: { url: objRumahAAtas, lebar: 66, tinggi: 34, bingkai: 1 },
    lebar: 4,
    tinggi: 4,
  },
  rumah_b: {
    bawah: { url: objRumahB, lebar: 50, tinggi: 25, bingkai: 1 },
    atas: { url: objRumahBAtas, lebar: 50, tinggi: 25, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  rumah_c: {
    bawah: { url: objRumahC, lebar: 82, tinggi: 37, bingkai: 1 },
    atas: { url: objRumahCAtas, lebar: 82, tinggi: 29, bingkai: 1 },
    lebar: 5,
    tinggi: 4,
  },
  rumah_d: {
    bawah: { url: objRumahD, lebar: 50, tinggi: 25, bingkai: 1 },
    atas: { url: objRumahDAtas, lebar: 50, tinggi: 25, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  rumah_nara: {
    bawah: { url: objRumahNara, lebar: 66, tinggi: 32, bingkai: 1 },
    atas: { url: objRumahNaraAtas, lebar: 66, tinggi: 34, bingkai: 1 },
    lebar: 4,
    tinggi: 4,
  },
  sekolah: {
    bawah: { url: objSekolah, lebar: 162, tinggi: 63, bingkai: 1 },
    atas: { url: objSekolahAtas, lebar: 162, tinggi: 35, bingkai: 1 },
    lebar: 10,
    tinggi: 6,
  },
  semak: {
    bawah: { url: objSemak, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  semak_b: {
    bawah: { url: objSemakB, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  sisa_piknik: {
    bawah: { url: objSisaPiknik, lebar: 34, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 2,
    tinggi: 1,
  },
  tali_lompat: {
    bawah: { url: objTaliLompat, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  tempat_sampah: {
    bawah: { url: objTempatSampah, lebar: 18, tinggi: 18, bingkai: 1 },
    atas: null,
    lebar: 1,
    tinggi: 1,
  },
  tenda_a: {
    bawah: { url: objTendaA, lebar: 50, tinggi: 26, bingkai: 1 },
    atas: { url: objTendaAAtas, lebar: 50, tinggi: 24, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  tenda_b: {
    bawah: { url: objTendaB, lebar: 50, tinggi: 26, bingkai: 1 },
    atas: { url: objTendaBAtas, lebar: 50, tinggi: 24, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  tiang_bendera: {
    bawah: { url: objTiangBendera, lebar: 18, tinggi: 17, bingkai: 1 },
    atas: { url: objTiangBenderaAtas, lebar: 18, tinggi: 33, bingkai: 1 },
    lebar: 1,
    tinggi: 3,
  },
  tiang_kamera: {
    bawah: { url: objTiangKamera, lebar: 18, tinggi: 17, bingkai: 1 },
    atas: { url: objTiangKameraAtas, lebar: 18, tinggi: 17, bingkai: 1 },
    lebar: 1,
    tinggi: 2,
  },
  tiang_lampu: {
    bawah: { url: objTiangLampu, lebar: 18, tinggi: 17, bingkai: 1 },
    atas: { url: objTiangLampuAtas, lebar: 18, tinggi: 17, bingkai: 1 },
    lebar: 1,
    tinggi: 2,
  },
  warung_made: {
    bawah: { url: objWarungMade, lebar: 50, tinggi: 27, bingkai: 1 },
    atas: { url: objWarungMadeAtas, lebar: 50, tinggi: 23, bingkai: 1 },
    lebar: 3,
    tinggi: 3,
  },
  warung_wifi: {
    bawah: { url: objWarungWifi, lebar: 66, tinggi: 29, bingkai: 1 },
    atas: { url: objWarungWifiAtas, lebar: 66, tinggi: 21, bingkai: 1 },
    lebar: 4,
    tinggi: 3,
  },
};

/**
 * Tokoh bukan pemain berkunci nama berkas tanpa .png: strip 2 bingkai (diam bernapas atau pose khusus) dengan titik
 * kaki di dalam satu bingkai.
 */
export const NPC: Readonly<Record<string, GambarNpc>> = {
  npc_anak1_bawah_diam: { url: npcAnak1BawahDiam, lebar: 14, tinggi: 20, bingkai: 2, kakiX: 7, kakiY: 17 },
  npc_anak2_bawah_diam: { url: npcAnak2BawahDiam, lebar: 14, tinggi: 20, bingkai: 2, kakiX: 7, kakiY: 17 },
  npc_bayu_bawah_diam: { url: npcBayuBawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_dimas_bawah_diam: { url: npcDimasBawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_dimas_kanan_motor: { url: npcDimasKananMotor, lebar: 34, tinggi: 30, bingkai: 2, kakiX: 17, kakiY: 28 },
  npc_gita_bawah_diam: { url: npcGitaBawahDiam, lebar: 14, tinggi: 20, bingkai: 2, kakiX: 7, kakiY: 17 },
  npc_ibu_bawah_diam: { url: npcIbuBawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_ibubayi_bawah_diam: { url: npcIbubayiBawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_komang_bawah_diam: { url: npcKomangBawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_komang_bawah_menunduk: { url: npcKomangBawahMenunduk, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_made_bawah_diam: { url: npcMadeBawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_nara_bawah_diam: { url: npcNaraBawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_nenek_bawah_diam: { url: npcNenekBawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_pedagang_bawah_diam: { url: npcPedagangBawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_petugas_bawah_diam: { url: npcPetugasBawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_polisi_bawah_diam: { url: npcPolisiBawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_raka_bawah_kursiroda: { url: npcRakaBawahKursiroda, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_ratih_bawah_diam: { url: npcRatihBawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_sinta_bawah_diam: { url: npcSintaBawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa1_bawah_diam: { url: npcSiswa1BawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa1_bawah_hp: { url: npcSiswa1BawahHp, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa2_bawah_diam: { url: npcSiswa2BawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa2_bawah_menunduk: { url: npcSiswa2BawahMenunduk, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa3_bawah_diam: { url: npcSiswa3BawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa4_bawah_diam: { url: npcSiswa4BawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa5_bawah_diam: { url: npcSiswa5BawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa5_bawah_hp: { url: npcSiswa5BawahHp, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_siswa6_bawah_diam: { url: npcSiswa6BawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
  npc_warga1_bawah_diam: { url: npcWarga1BawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_warga1_bawah_menunjuk: { url: npcWarga1BawahMenunjuk, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_warga2_bawah_diam: { url: npcWarga2BawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_warga3_bawah_diam: { url: npcWarga3BawahDiam, lebar: 16, tinggi: 26, bingkai: 2, kakiX: 8, kakiY: 23 },
  npc_wayan_bawah_diam: { url: npcWayanBawahDiam, lebar: 16, tinggi: 24, bingkai: 2, kakiX: 8, kakiY: 21 },
};

/**
 * Ikon berkunci nama berkas tanpa .png. Ikon kepala avatar ada di AVATAR. Strip lebih dari satu bingkai: ikon_bintang
 * 3, ikon_menyambung 2.
 */
export const IKON: Readonly<Record<string, Gambar>> = {
  ikon_arsip: { url: ikonArsip, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_bintang: { url: ikonBintang, lebar: 16, tinggi: 16, bingkai: 3 },
  ikon_bulan: { url: ikonBulan, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_centang: { url: ikonCentang, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_emosi_hati: { url: ikonEmosiHati, lebar: 8, tinggi: 8, bingkai: 1 },
  ikon_emosi_keringat: { url: ikonEmosiKeringat, lebar: 8, tinggi: 8, bingkai: 1 },
  ikon_emosi_seru: { url: ikonEmosiSeru, lebar: 8, tinggi: 8, bingkai: 1 },
  ikon_emosi_tanya: { url: ikonEmosiTanya, lebar: 8, tinggi: 8, bingkai: 1 },
  ikon_jam: { url: ikonJam, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_jejak: { url: ikonJejak, lebar: 32, tinggi: 32, bingkai: 1 },
  ikon_karcis: { url: ikonKarcis, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_kompas: { url: ikonKompas, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_lari: { url: ikonLari, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_layar_penuh: { url: ikonLayarPenuh, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_matahari: { url: ikonMatahari, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_menyambung: { url: ikonMenyambung, lebar: 16, tinggi: 16, bingkai: 2 },
  ikon_mini_halte: { url: ikonMiniHalte, lebar: 7, tinggi: 7, bingkai: 1 },
  ikon_mini_kejadian: { url: ikonMiniKejadian, lebar: 7, tinggi: 7, bingkai: 1 },
  ikon_mini_selesai: { url: ikonMiniSelesai, lebar: 7, tinggi: 7, bingkai: 1 },
  ikon_peringatan: { url: ikonPeringatan, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_petunjuk: { url: ikonPetunjuk, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_putar_hp: { url: ikonPutarHp, lebar: 32, tinggi: 32, bingkai: 1 },
  ikon_suara_mati: { url: ikonSuaraMati, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_suara_nyala: { url: ikonSuaraNyala, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_teropong: { url: ikonTeropong, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_zona_1: { url: ikonZona1, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_zona_2: { url: ikonZona2, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_zona_3: { url: ikonZona3, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_zona_4: { url: ikonZona4, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_zona_5: { url: ikonZona5, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_zona_6: { url: ikonZona6, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_zona_7: { url: ikonZona7, lebar: 16, tinggi: 16, bingkai: 1 },
  ikon_zona_8: { url: ikonZona8, lebar: 16, tinggi: 16, bingkai: 1 },
};

/**
 * Penanda dan efek berkunci nama berkas tanpa .png; berkasnya di folder ikon/. Urutan bingkai:
 * - tanda_diri: bawah, atas, kanan, kiri;
 * - tanda_kompas: dua bingkai (biasa, lalu terang) untuk setiap arah, berurutan atas, kanan atas, kanan, kanan bawah,
 *   bawah, kiri bawah, kiri, kiri atas;
 * - tanda_kotak_*: kecil, besar berkilau, lalu biasa.
 */
export const TANDA: Readonly<Record<string, Gambar>> = {
  tanda_debu: { url: tandaDebu, lebar: 8, tinggi: 6, bingkai: 2 },
  tanda_dibuka: { url: tandaDibuka, lebar: 12, tinggi: 12, bingkai: 1 },
  tanda_diri: { url: tandaDiri, lebar: 7, tinggi: 7, bingkai: 4 },
  tanda_kejadian: { url: tandaKejadian, lebar: 12, tinggi: 12, bingkai: 1 },
  tanda_kilau: { url: tandaKilau, lebar: 8, tinggi: 8, bingkai: 2 },
  tanda_kompas: { url: tandaKompas, lebar: 7, tinggi: 7, bingkai: 16 },
  tanda_kotak_buku: { url: tandaKotakBuku, lebar: 14, tinggi: 12, bingkai: 3 },
  tanda_kotak_karcis: { url: tandaKotakKarcis, lebar: 14, tinggi: 12, bingkai: 3 },
  tanda_kotak_kompas: { url: tandaKotakKompas, lebar: 14, tinggi: 12, bingkai: 3 },
  tanda_kotak_sepatu: { url: tandaKotakSepatu, lebar: 14, tinggi: 12, bingkai: 3 },
  tanda_kotak_teropong: { url: tandaKotakTeropong, lebar: 14, tinggi: 12, bingkai: 3 },
  tanda_selesai: { url: tandaSelesai, lebar: 10, tinggi: 10, bingkai: 1 },
};
