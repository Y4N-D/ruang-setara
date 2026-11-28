// Tombol skill di HUD (spesifikasi JS-09, P-33 sampai P-36, P-38, dan P-39; Design System 3.3, 3.4, dan 10). Di
// perangkat sentuh tombol membentuk lengkung di sekitar Periksa; di laptop berupa kolom di kanan bawah dengan tanda
// tombol 1, 2, dan 3. Status tombol dihitung modul murni dunia/skill.ts; komponen ini hanya menampilkannya.
// JS-18 (P-18, P-27 sampai P-30): lima tombol dengan tanda 1 sampai 5; di perangkat sentuh Teropong dan Angkot di baris
// bawah, dan di laptop satu kolom atau dua kolom (`kolom2`) menurut tinggi dunia. Angkot ber-`data-dekat` di halte.
// JS-24 (P-7): setiap tombol memakai aturan ketukan HUD, sehingga jari kedua bisa memakai skill selama analog dipegang.
import { IKON } from "../assets/manifest";
import { SKILL_URUT } from "../inti/aturan";
import type { SkillId } from "../inti/tipe";
import { isiTeks, TEKS } from "../teks";
import { letakTombol, type StatusTombol } from "./dunia/skill";
import { useTekanHud } from "./tekanHud";

function ButirSkill({ b, label, sentuh, kunci, tinggiJeda, saatTekan }: { b: StatusTombol; label: string; sentuh: boolean; kunci: string; tinggiJeda: number; saatTekan: (s: SkillId) => void }) {
  const tekan = useTekanHud(() => saatTekan(b.skill));
  return (
    <button
      type="button"
      className="js-tombol-skill"
      data-skill={b.skill}
      data-muatan={b.muatan}
      data-aktif={b.aktif ? "ya" : "tidak"}
      data-jeda={b.jeda > 0 ? "ya" : "tidak"}
      data-dekat={b.skill === "angkot" ? (b.dekat ? "ya" : "tidak") : undefined}
      data-ditekan={b.menunggu ? "ya" : undefined}
      aria-label={label}
      aria-disabled={b.muatan === 0 || b.aktif ? true : undefined}
      aria-keyshortcuts={sentuh ? undefined : kunci}
      {...tekan}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
      <img className="js-skill-ikon" src={IKON[b.skill === "angkot" ? "ikon_karcis" : `ikon_${b.skill}`].url} alt="" width={32} height={32} />
      {b.jeda > 0 ? (
        <span className="js-skill-tutup" aria-hidden="true">
          <span className="js-skill-jeda" style={{ height: `${tinggiJeda}%` }} />
        </span>
      ) : null}
      <span className="js-skill-lencana" aria-hidden="true">
        {b.muatan}
      </span>
    </button>
  );
}

export interface PropsTombolSkill {
  /** Skill yang aktif di ruang, menurut urutan P-1. */
  daftar: readonly StatusTombol[];
  /** Lengkung di perangkat sentuh; satu atau dua kolom di laptop (JS-18, P-28). */
  letak: "lengkung" | "kolom" | "kolom2";
  kurangiGerak: boolean;
  saatTekan: (s: SkillId) => void;
}

export default function TombolSkill({ daftar, letak, kurangiGerak, saatTekan }: PropsTombolSkill) {
  const sentuh = letak === "lengkung";
  const susun = sentuh ? null : letakTombol(daftar.map((b) => b.skill), letak);
  return (
    <div className="js-skill" data-letak={letak} role="group" aria-label={TEKS.skill.kelompok}>
      {daftar.map((b) => {
        const teks = b.aktif ? TEKS.skill.tombolAktif : b.dekat ? TEKS.skill.tombolHalte : TEKS.skill.tombol;
        const label = isiTeks(teks, { skill: TEKS.skill[b.skill], n: b.muatan });
        // Kurangi gerak (P-40): blok jeda tampil penuh selama 2 detik, tanpa menyusut bertahap.
        const tinggiJeda = kurangiGerak ? 100 : (b.jeda / 8) * 100;
        // Tombol papan ketik tetap per skill (1 sampai 5), walaupun skill lain dimatikan (P-35, P-38; JS-18 P-28).
        const kunci = String(SKILL_URUT.indexOf(b.skill) + 1);
        const tempat = susun?.get(b.skill);
        return (
          <div key={b.skill} className="js-skill-butir" data-skill={b.skill} data-tingkat={tempat?.tingkat} data-kolom={tempat?.kiri ? "kiri" : undefined}>
            {sentuh ? null : (
              <kbd className="js-skill-kbd" aria-hidden="true">
                {kunci}
              </kbd>
            )}
            <ButirSkill b={b} label={label} sentuh={sentuh} kunci={kunci} tinggiJeda={tinggiJeda} saatTekan={saatTekan} />
          </div>
        );
      })}
    </div>
  );
}
