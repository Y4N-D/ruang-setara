// Penyaring nama buatan siswa (spesifikasi JS-14, P-43 dan Lampiran A). Murni dan hanya diimpor server: daftar
// katanya tidak pernah dikirim ke HP (P-38, P-71). Batas yang diketahui (kata yang huruf vokalnya dibuang, kata pendek
// yang disambung kata lain, dan ejekan dengan kata biasa) ditangani guru lewat Ganti nama (bagian "Keamanan dan privasi").

/** Kata "potongan": ditolak bila berdiri sendiri maupun bila menjadi bagian sebuah kata. */
const POTONGAN: readonly string[] = [
  // Makian umum dan hewan
  "anjing", "bangsat", "bajingan", "brengsek", "keparat", "bedebah", "jahanam", "kampret", "cecunguk", "sompret", "monyet", "kunyuk",
  // Merendahkan kecerdasan
  "goblok", "goblog", "tolol", "idiot", "bodoh",
  // Seksual dan cabul
  "kontol", "memek", "ngentot", "ngewe", "jembut", "toket", "pepek", "colmek", "bokep", "perkosa", "pelacur", "lonte", "sundal", "jablay", "bispak",
  // Merendahkan disabilitas dan tubuh
  "autis", "lumpuh", "pincang", "gendut", "gembrot", "jelek", "botak", "pesek", "cebol", "dekil", "ompong",
  // Kekerasan, narkoba, dan tokoh kejam
  "teroris", "narkoba", "hitler",
  // Bahasa Jawa, Sunda, Melayu, dan Inggris
  "jancuk", "jancok", "dancuk", "ndasmu", "matamu", "belegug", "pukimak", "fuck", "bitch", "asshole", "bastard",
];

/** Kata "utuh": hanya ditolak bila berdiri sendiri, karena sering menjadi bagian kata biasa ("tai" di "pantai"). */
const UTUH: readonly string[] = [
  "babi", "bangke", "setan", "iblis", "laknat", "sialan", "mampus", "bacot",
  "bego", "dungu", "dongo", "oon", "bloon", "pekok", "bodho",
  "entot", "tetek", "peler", "titit", "coli", "sange", "porno", "mesum", "cabul", "perek", "pecun", "germo", "seks", "sex", "turuk",
  "tai", "taik", "tahi", "taek", "berak", "pantat", "kentut",
  "kafir", "cina", "negro", "keling", "jawir", "item", "nigga", "nigger",
  "cacat", "budek", "gila", "sinting", "gagap", "bau",
  "homo", "lesbi", "bencong", "banci", "gay",
  "bunuh", "nazi", "sabu", "ganja", "miras", "mabok",
  "asu", "cuk", "raimu", "celeng", "edan", "gendeng", "gendheng", "modar",
  "anjir", "anjay", "anjrit", "njir", "kehed", "gelo", "sia",
  "cicing", "bojog", "buduh",
  "kimak", "puki", "pantek",
  "shit", "dick", "pussy", "porn", "slut", "whore",
];

/** Kata biasa yang memuat kata "potongan" dan tidak boleh ditolak. */
const IZIN: readonly string[] = ["memekik"];

/** Untuk uji: daftar seperti tertulis di Lampiran A spesifikasi JS-14. */
export const DAFTAR_PENYARING = { potongan: POTONGAN, utuh: UTUH, izin: IZIN } as const;

const ANGKA: Readonly<Record<string, string>> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "6": "g", "7": "t", "8": "b", "9": "g" };
const rapat = (t: string) => t.replace(/(.)\1+/g, "$1");

const POTONGAN_R = POTONGAN.map(rapat);
const SEMUA_R = new Set([...POTONGAN_R, ...UTUH.map(rapat)]);
const IZIN_R = new Set(IZIN.map(rapat));

/**
 * Kerangka nama (P-43): tanpa tanda diakritik, huruf kecil, angka diganti huruf, karakter selain a–z memisahkan kata,
 * kata satu huruf yang berurutan disatukan, dan huruf berulang dirapatkan.
 */
export function kerangkaNama(nama: string): string[] {
  const k = nama
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[0-9]/g, (c) => ANGKA[c] ?? " ");
  const kata: string[] = [];
  let satuHuruf = "";
  for (const x of k.split(/[^a-z]+/)) {
    if (!x) continue;
    if (x.length === 1) {
      satuHuruf += x;
      continue;
    }
    if (satuHuruf) {
      kata.push(satuHuruf);
      satuHuruf = "";
    }
    kata.push(x);
  }
  if (satuHuruf) kata.push(satuHuruf);
  return kata.map(rapat);
}

const memuatPotongan = (kata: string) => POTONGAN_R.some((w) => kata.includes(w));

/** Benar bila nama ditolak penyaring (P-43, aturan 1 sampai 3). */
export function namaTertolak(nama: string): boolean {
  const kata = kerangkaNama(nama);
  if (kata.some((x) => SEMUA_R.has(x))) return true;
  if (kata.some((x) => !IZIN_R.has(x) && memuatPotongan(x))) return true;
  for (let i = 0; i + 1 < kata.length; i++) {
    if (kata[i].length > 3 || kata[i + 1].length > 3) continue;
    const gabung = rapat(kata[i] + kata[i + 1]);
    if (SEMUA_R.has(gabung) || memuatPotongan(gabung)) return true;
  }
  return false;
}
