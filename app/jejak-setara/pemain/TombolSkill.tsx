// Tombol skill di HUD (spesifikasi JS-09, P-33 sampai P-36, P-38, dan P-39; Design System 3.3, 3.4, dan 10). Di
// perangkat sentuh tombol membentuk lengkung di sekitar Periksa; di laptop berupa kolom di kanan bawah dengan tanda
// tombol 1, 2, dan 3. Status tombol dihitung modul murni dunia/skill.ts; komponen ini hanya menampilkannya.
import { IKON } from "../assets/manifest";
import { SKILL_P0, type SkillP0 } from "../inti/aturan";
import { isiTeks, TEKS } from "../teks";
import type { StatusTombol } from "./dunia/skill";


export interface PropsTombolSkill {
  /** Skill yang aktif di ruang, menurut urutan P-1. */
  daftar: readonly StatusTombol[];
  sentuh: boolean;
  kurangiGerak: boolean;
  saatTekan: (s: SkillP0) => void;
}

export default function TombolSkill({ daftar, sentuh, kurangiGerak, saatTekan }: PropsTombolSkill) {
  return (
    <div className="js-skill" data-letak={sentuh ? "lengkung" : "kolom"} role="group" aria-label={TEKS.skill.kelompok}>
      {daftar.map((b) => {
        const label = isiTeks(b.aktif ? TEKS.skill.tombolAktif : TEKS.skill.tombol, { skill: TEKS.skill[b.skill], n: b.muatan });
        // Kurangi gerak (P-40): blok jeda tampil penuh selama 2 detik, tanpa menyusut bertahap.
        const tinggiJeda = kurangiGerak ? 100 : (b.jeda / 8) * 100;
        // Tombol papan ketik tetap per skill (1, 2, 3), walaupun skill lain dimatikan (P-35, P-38).
        const kunci = String(SKILL_P0.indexOf(b.skill) + 1);
        return (
          <div key={b.skill} className="js-skill-butir" data-skill={b.skill}>
            {sentuh ? null : (
              <kbd className="js-skill-kbd" aria-hidden="true">
                {kunci}
              </kbd>
            )}
            <button
              type="button"
              className="js-tombol-skill"
              data-skill={b.skill}
              data-muatan={b.muatan}
              data-aktif={b.aktif ? "ya" : "tidak"}
              data-jeda={b.jeda > 0 ? "ya" : "tidak"}
              data-ditekan={b.menunggu ? "ya" : undefined}
              aria-label={label}
              aria-disabled={b.muatan === 0 || b.aktif ? true : undefined}
              aria-keyshortcuts={sentuh ? undefined : kunci}
              onClick={() => saatTekan(b.skill)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
              <img className="js-skill-ikon" src={IKON[`ikon_${b.skill}`].url} alt="" width={32} height={32} />
              {b.jeda > 0 ? (
                <span className="js-skill-tutup" aria-hidden="true">
                  <span className="js-skill-jeda" style={{ height: `${tinggiJeda}%` }} />
                </span>
              ) : null}
              <span className="js-skill-lencana" aria-hidden="true">
                {b.muatan}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
