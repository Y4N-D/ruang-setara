// Isi versi kejadian untuk uji statistik JS-13 (bukan berkas uji).
export function isiVersiUji(judul: string) {
  return JSON.stringify({
    kode: "K-90",
    judul,
    zona: "z7",
    langkah1: {
      pertanyaan: "Hak siapa yang paling terganggu?",
      opsi: [
        { id: "1a", teks: "Hak ibu", benar: true, umpanBalik: "x" },
        { id: "1b", teks: "Hak Raka", benar: false, umpanBalik: "x" },
        { id: "1c", teks: "Hak petugas", benar: false, umpanBalik: "x" },
        { id: "1d", teks: "Hak pengunjung", benar: false, umpanBalik: "x" },
      ],
      petunjuk: "x",
    },
    langkah2: {
      pertanyaan: "Apa yang kamu lakukan?",
      opsi: [
        { id: "2a", teks: "Menolak", tingkat: "tepat", terjadi: "x" },
        { id: "2b", teks: "Diam", tingkat: "kurang", terjadi: "x" },
        { id: "2c", teks: "Ikut", tingkat: "berisiko", terjadi: "x" },
      ],
    },
  });
}
