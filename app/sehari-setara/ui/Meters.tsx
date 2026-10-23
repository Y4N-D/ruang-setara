// Panel indikator kiri (Design System bagian 7; spesifikasi F-06).
// Menampilkan nilai yang diberikan PlayScreen; gerak, nilai sebelum memilih, dan angka melayang dihitung di sana.
import { icons } from "../assets/manifest";
import { copy } from "../content/copy";
import type { Choice } from "../engine/types";
import { effectDirection, effectText, segmentFills, type MeterValues } from "./impact";

const METERS = [
  { key: "hak", label: copy.meters.hak, icon: icons.hak },
  { key: "kewajiban", label: copy.meters.kewajiban, icon: icons.kewajiban },
] as const;

interface MetersProps {
  /** Nilai yang sedang tampil. */
  values: MeterValues;
  /** Efek pilihan adegan berjalan; angka melayang tampil hanya bila tidak null. */
  effects: Choice["effects"] | null;
  scale: number;
}

export function Meters({ values, effects, scale }: MetersProps) {
  return (
    <div
      className="ss-meters"
      role="group"
      aria-label={copy.meters.group}
      // Lebar sampai tepi kiri bingkai panggung (lebar layar ÷ 2 − 160k).
      style={{ width: `calc(50% - ${160 * scale}px)` }}
    >
      {METERS.map(({ key, label, icon }) => {
        const value = values[key];
        const labelId = `ss-meter-${key}`;
        return (
          <div
            key={key}
            className="ss-meter"
            data-meter={key}
            role="meter"
            aria-labelledby={labelId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={copy.meters.valueText(value)}
          >
            <p className="ss-meter-label">
              <span className="ss-meter-icon" aria-hidden="true" style={{ backgroundImage: `url(${icon})` }} />
              <span id={labelId} className="ss-meter-name">
                {label}
              </span>
            </p>
            <div className="ss-meter-row" aria-hidden="true">
              <span className="ss-meter-bar">
                {segmentFills(value).map((fill, index) => (
                  <span key={index} className="ss-meter-seg" data-isi={fill} />
                ))}
              </span>
              <span className="ss-meter-value">{value}</span>
              {effects && (
                <span className="ss-meter-delta" data-arah={effectDirection(effects[key])}>
                  {effectText(effects[key])}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
