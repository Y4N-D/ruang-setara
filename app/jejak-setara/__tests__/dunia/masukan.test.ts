// Masukan keyboard dan joystick (spesifikasi JS-07, P-12 sampai P-14; AC-6 dan AC-7).
import { describe, expect, it } from "vitest";
import { arahJoystick, arahKeyboard, JOYSTICK, Masukan, perangkatSentuh, TOMBOL_GULIR } from "../../pemain/dunia/masukan";

describe("keyboard (P-12)", () => {
  it("W A S D dan panah memberi kedelapan arah; tombol berlawanan saling meniadakan", () => {
    const arah = (...k: string[]) => arahKeyboard(new Set(k));
    expect(arah("KeyW")).toEqual({ dx: 0, dy: -1 });
    expect(arah("ArrowDown")).toEqual({ dx: 0, dy: 1 });
    expect(arah("KeyA", "ArrowUp")).toEqual({ dx: -1, dy: -1 });
    expect(arah("KeyD", "KeyS")).toEqual({ dx: 1, dy: 1 });
    expect(arah("KeyD", "ArrowRight")).toEqual({ dx: 1, dy: 0 });
    expect(arah("KeyA", "KeyD")).toEqual({ dx: 0, dy: 0 });
    expect(arah("KeyQ", "Space")).toEqual({ dx: 0, dy: 0 });
    const delapan = new Set<string>();
    for (const a of ["KeyW", "KeyS", ""]) for (const b of ["KeyA", "KeyD", ""]) delapan.add(JSON.stringify(arah(...[a, b].filter(Boolean))));
    expect(delapan.size).toBe(9); // delapan arah ditambah diam
  });

  it("tombol panah ditandai agar tidak menggulir halaman; W A S D tidak", () => {
    expect([...TOMBOL_GULIR].sort()).toEqual(["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"]);
  });

  it("tombol dilepas semua saat jendela kehilangan fokus atau tab tersembunyi", () => {
    const m = new Masukan();
    expect(m.tekan("KeyD")).toBe(true);
    expect(m.tekan("KeyP")).toBe(false);
    expect(m.arah()).toEqual({ dx: 1, dy: 0 });
    m.lepasSemua();
    expect(m.arah()).toEqual({ dx: 0, dy: 0 });
  });
});

describe("joystick (P-13)", () => {
  it("ukuran 48/24 px dan zona diam 8 px", () => {
    expect(JOYSTICK).toEqual({ radius: 48, kenop: 24, zonaDiam: 8 });
    expect(arahJoystick({ x: 100, y: 100 }, { x: 107, y: 103 })).toMatchObject({ dx: 0, dy: 0 });
    expect(arahJoystick({ x: 100, y: 100 }, { x: 108, y: 100 })).toMatchObject({ dx: 0, dy: 0 });
    expect(arahJoystick({ x: 100, y: 100 }, { x: 109, y: 100 })).toMatchObject({ dx: 1, dy: 0 });
  });

  it("arah 360° dengan kecepatan penuh, kenop tetap di dalam lingkaran", () => {
    const a = arahJoystick({ x: 0, y: 0 }, { x: 30, y: 40 });
    expect(a.dx).toBeCloseTo(0.6, 9);
    expect(a.dy).toBeCloseTo(0.8, 9);
    const jauh = arahJoystick({ x: 0, y: 0 }, { x: 300, y: -400 });
    expect(Math.hypot(jauh.kenopX, jauh.kenopY)).toBeCloseTo(48, 9);
    expect(Math.hypot(jauh.dx, jauh.dy)).toBeCloseTo(1, 9);
  });

  it("muncul di sentuhan pertama separuh kiri, hanya satu jari diikuti, hilang saat diangkat", () => {
    const m = new Masukan();
    expect(m.mulaiJoystick(1, 500, 200, 731)).toBe(false); // separuh kanan
    expect(m.mulaiJoystick(1, 100, 200, 731)).toBe(true);
    expect(m.mulaiJoystick(2, 120, 220, 731)).toBe(false); // jari kedua
    expect(m.gerakJoystick(2, 300, 200)).toBe(false);
    expect(m.gerakJoystick(1, 100, 100)).toBe(true);
    expect(m.arah()).toEqual({ dx: 0, dy: -1 });
    m.tekan("KeyD");
    expect(m.arah()).toEqual({ dx: 0, dy: -1 }); // joystick lebih dulu selama dipakai
    expect(m.akhiriJoystick(2)).toBe(false);
    expect(m.akhiriJoystick(1)).toBe(true);
    expect(m.joystick).toBeNull();
    expect(m.arah()).toEqual({ dx: 1, dy: 0 });
  });

  it("perangkat sentuh: pointer coarse atau maxTouchPoints > 0", () => {
    const mq = (cocok: boolean) => () => ({ matches: cocok });
    expect(perangkatSentuh({ matchMedia: mq(true), navigator: { maxTouchPoints: 0 } })).toBe(true);
    expect(perangkatSentuh({ matchMedia: mq(false), navigator: { maxTouchPoints: 5 } })).toBe(true);
    expect(perangkatSentuh({ matchMedia: mq(false), navigator: { maxTouchPoints: 0 } })).toBe(false);
    expect(perangkatSentuh({})).toBe(false);
  });
});
