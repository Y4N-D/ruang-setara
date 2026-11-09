// Joystick sentuh (spesifikasi JS-07, P-13; Design System 3.3 dan 10): lingkaran radius 48 px berlatar cream 85%
// bergaris ink, kenop bergaris tengah 24 px berwarna sun. Hanya tampil selama jari menyentuh.
import { JOYSTICK, type KeadaanJoystick } from "./dunia/masukan";

export default function Joystick({ j }: { j: KeadaanJoystick | null }) {
  if (!j) return null;
  return (
    <div className="js-joystick" aria-hidden="true" style={{ left: j.pusatX - JOYSTICK.radius, top: j.pusatY - JOYSTICK.radius }}>
      <div
        className="js-joystick-kenop"
        style={{ left: JOYSTICK.radius + j.kenopX - JOYSTICK.kenop / 2, top: JOYSTICK.radius + j.kenopY - JOYSTICK.kenop / 2 }}
      />
    </div>
  );
}
