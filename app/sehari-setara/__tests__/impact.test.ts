// Uji unit hitungan indikator dan kartu dampak (spesifikasi F-06, AC-15).
import { describe, expect, it } from "vitest";
import { SCENES } from "../content/scenes";
import { metersFromHistory } from "../engine/rules";
import type { ChoiceId, HistoryEntry } from "../engine/types";
import {
  effectDirection,
  effectText,
  IMPACT_GUARD_MS,
  impactAnnouncement,
  METER_SEGMENTS,
  METER_STEP_MS,
  meterSentence,
  meterSteps,
  meterValueAt,
  metersBefore,
  segmentFills,
  TIER_ICON,
} from "../ui/impact";

const path = (ids: readonly ChoiceId[]): HistoryEntry[] =>
  ids.map((choiceId, index) => ({ sceneId: SCENES[index].id, choiceId, teamId: "tim", stars: 0 }));
const repeat = (id: ChoiceId): ChoiceId[] => Array.from({ length: SCENES.length }, () => id);
const count = (fills: readonly string[], fill: string) => fills.filter((item) => item === fill).length;

describe("konstanta (spesifikasi F-06)", () => {
  it("sesuai bagian Berkas dan ekspor", () => {
    expect(METER_STEP_MS).toBe(100);
    expect(IMPACT_GUARD_MS).toBe(600);
    expect(METER_SEGMENTS).toBe(10);
  });

  it("masa tunggu tidak lebih pendek dari gerak indikator terpanjang (4 langkah)", () => {
    expect(IMPACT_GUARD_MS).toBeGreaterThanOrEqual(4 * METER_STEP_MS);
  });
});

describe("segmen", () => {
  it("penuh, separuh, dan kosong sesuai nilai", () => {
    const table: [number, number, number, number][] = [
      // nilai, penuh, separuh, kosong
      [0, 0, 0, 10],
      [5, 0, 1, 9],
      [10, 1, 0, 9],
      [45, 4, 1, 5],
      [50, 5, 0, 5],
      [65, 6, 1, 3],
      [75, 7, 1, 2],
      [95, 9, 1, 0],
      [100, 10, 0, 0],
    ];
    for (const [value, full, half, empty] of table) {
      const fills = segmentFills(value);
      expect(fills).toHaveLength(10);
      expect([count(fills, "penuh"), count(fills, "separuh"), count(fills, "kosong")], `nilai ${value}`).toEqual([full, half, empty]);
    }
  });

  it("segmen separuh selalu tepat sesudah segmen penuh terakhir", () => {
    expect(segmentFills(65)).toEqual(["penuh", "penuh", "penuh", "penuh", "penuh", "penuh", "separuh", "kosong", "kosong", "kosong"]);
  });
});

describe("gerak indikator", () => {
  it("langkah setengah segmen", () => {
    expect(meterSteps(50, 65)).toBe(3);
    expect(meterSteps(80, 60)).toBe(4);
    expect(meterSteps(100, 100)).toBe(0);
    expect(meterSteps(95, 100)).toBe(1);
  });

  it("naik dan turun satu setengah segmen setiap 100 ms", () => {
    const at = (before: number, after: number) => [0, 99, 100, 200, 300, 400, 1000].map((ms) => meterValueAt(before, after, ms));
    expect(at(50, 65)).toEqual([50, 50, 55, 60, 65, 65, 65]);
    expect(at(80, 60)).toEqual([80, 80, 75, 70, 65, 60, 60]);
  });

  it("mentok dan efek nol tidak bergerak, dan batas sebagian berhenti di nilai sesudah", () => {
    for (const ms of [0, 100, 400]) {
      expect(meterValueAt(100, 100, ms)).toBe(100);
      expect(meterValueAt(45, 45, ms)).toBe(45);
    }
    expect([0, 100, 200].map((ms) => meterValueAt(95, 100, ms))).toEqual([95, 100, 100]);
  });

  it("selesai paling lambat 400 ms untuk efek terbesar", () => {
    expect(meterValueAt(50, 70, 4 * METER_STEP_MS)).toBe(70);
    expect(meterValueAt(50, 30, 4 * METER_STEP_MS)).toBe(30);
  });
});

describe("angka melayang", () => {
  it("teks dan arah efek naskah, dengan tanda minus U+2212", () => {
    expect(effectText(15)).toBe("+15");
    expect(effectText(-10)).toBe("\u221210");
    expect(effectText(0)).toBe("0");
    expect(effectDirection(15)).toBe("naik");
    expect(effectDirection(-10)).toBe("turun");
    expect(effectDirection(0)).toBe("nol");
  });
});

describe("nilai sebelum memilih", () => {
  it("sama dengan history pilihan sebelumnya, pada tiga jalur naskah", () => {
    for (const id of ["A", "B", "C"] as const) {
      const full = path(repeat(id));
      SCENES.forEach((scene, index) => {
        const sofar = full.slice(0, index + 1);
        expect(metersBefore(sofar, SCENES, scene.id), `jalur ${id}, adegan ${index + 1}`).toEqual(
          metersFromHistory(full.slice(0, index), SCENES),
        );
      });
    }
  });

  it("jalur semua B sudah mentok 100 sebelum adegan 5", () => {
    const sofar = path(repeat("B")).slice(0, 5);
    expect(metersBefore(sofar, SCENES, SCENES[4].id)).toEqual({ hak: 100, kewajiban: 100 });
    expect(metersFromHistory(sofar, SCENES)).toEqual({ hak: 100, kewajiban: 100 });
  });
});

describe("pengumuman kartu", () => {
  it("kalimat indikator: berubah, mentok, dan efek nol", () => {
    expect(meterSentence("Hak orang lain terjaga", -10, 40, 30)).toBe("Hak orang lain terjaga \u221210, menjadi 30.");
    expect(meterSentence("Hak orang lain terjaga", 15, 100, 100)).toBe("Hak orang lain terjaga +15, tetap 100.");
    expect(meterSentence("Hak orang lain terjaga", 0, 45, 45)).toBe("Hak orang lain terjaga 0, tetap 45.");
  });

  it("contoh adegan 2 pilihan A pada jalur semua A sama dengan spesifikasi", () => {
    const history = path(["A", "A"]);
    const choice = SCENES[1].choices[0];
    expect(choice.id).toBe("A");
    const text = impactAnnouncement(choice, metersBefore(history, SCENES, SCENES[1].id), metersFromHistory(history, SCENES));
    expect(text).toBe(
      "Kartu dampak: Berisiko. Hak orang lain terjaga \u221210, menjadi 30. Kewajiban dijalankan \u221220, menjadi 15. " +
        "Yang terjadi: Nara sampai lebih cepat, tetapi berboncengan tanpa helm dengan pengendara yang belum punya SIM " +
        "membahayakan keselamatan keduanya. Mereka juga melanggar aturan lalu lintas. " +
        "Hak yang terdampak: Hak atas pendidikan dan rasa aman. Kewajiban terkait: Kewajiban menaati aturan lalu lintas. " +
        "Rujukan: Pasal 28G ayat (1) UUD NRI 1945; Pasal 31 ayat (1) UUD NRI 1945; Pasal 27 ayat (1) UUD NRI 1945; " +
        "UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8).",
    );
  });

  it("contoh adegan 5 pilihan B pada jalur semua B memakai kata tetap", () => {
    const history = path(repeat("B")).slice(0, 5);
    const choice = SCENES[4].choices[1];
    const text = impactAnnouncement(choice, metersBefore(history, SCENES, SCENES[4].id), metersFromHistory(history, SCENES));
    expect(text).toContain("Kartu dampak: Tepat. Hak orang lain terjaga +15, tetap 100. Kewajiban dijalankan +15, tetap 100. Yang terjadi: ");
  });

  it("memuat semua rujukan setiap pilihan, berurutan", () => {
    for (const scene of SCENES) {
      for (const choice of scene.choices) {
        const text = impactAnnouncement(choice, { hak: 50, kewajiban: 50 }, { hak: 50, kewajiban: 50 });
        expect(text.endsWith(`Rujukan: ${choice.impact.rujukan.map((reference) => reference.text).join("; ")}.`)).toBe(true);
      }
    }
  });
});

describe("ikon tingkat", () => {
  it("sama dengan ikon emosi reaksi ke-18 pilihan", () => {
    let checked = 0;
    for (const scene of SCENES) {
      for (const choice of scene.choices) {
        expect(choice.emote?.icon, `${scene.id} ${choice.id}`).toBe(TIER_ICON[choice.tier]);
        checked += 1;
      }
    }
    expect(checked).toBe(18);
  });
});
