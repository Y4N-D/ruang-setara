// PDF satu halaman A4 berisi gambar lembar rekap, tanpa pustaka PDF (spesifikasi F-09, bagian "PDF"; diuji di pdf.test.ts).
// Gambar disimpan sebagai RGB 8 bit dengan /FlateDecode lewat CompressionStream("deflate"), tanpa kompresi yang
// menurunkan mutu, dan dengan /Interpolate false agar piksel tetap tajam.

/** Ukuran A4 tegak dalam pt. */
export const A4_PT = { w: 595.28, h: 841.89 } as const;

export interface PdfPlacement {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Letak gambar dalam pt: diperkecil sebanding sampai muat lebar dan tinggi A4, rata atas dan rata tengah mendatar. */
export function pdfPlacement(w: number, h: number): PdfPlacement {
  const scale = Math.min(A4_PT.w / w, A4_PT.h / h);
  const width = w * scale;
  const height = h * scale;
  return { x: (A4_PT.w - width) / 2, y: A4_PT.h - height, w: width, h: height };
}

/** Bilangan untuk isi halaman PDF: paling banyak dua angka di belakang titik, tanpa nol di ujung. */
function num(value: number): string {
  return String(Math.round(value * 100) / 100);
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * PDF 1.4: katalog, halaman, gambar (/DeviceRGB, 8 bit, /FlateDecode, /Interpolate false), dan isi halaman, ditambah
 * tabel xref dengan posisi byte yang benar. rgb berisi w × h × 3 byte, baris dari atas ke bawah.
 */
export async function pdfFromRgb(w: number, h: number, rgb: Uint8Array): Promise<Uint8Array> {
  if (rgb.length !== w * h * 3) throw new Error("Ukuran data gambar tidak sesuai");
  const image = await deflate(rgb);
  const place = pdfPlacement(w, h);
  const content = new TextEncoder().encode(`q ${num(place.w)} 0 0 ${num(place.h)} ${num(place.x)} ${num(place.y)} cm /Im0 Do Q`);

  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
    parts.push(bytes);
    length += bytes.length;
  };
  const object = (n: number, dictionary: string, stream?: Uint8Array) => {
    offsets[n] = length;
    push(`${n} 0 obj\n${dictionary}\n`);
    if (stream) {
      push("stream\n");
      push(stream);
      push("\nendstream\n");
    }
    push("endobj\n");
  };

  // Baris kedua berisi byte di atas 127, tanda bahwa berkas ini biner.
  push("%PDF-1.4\n");
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_PT.w} ${A4_PT.h}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  object(
    4,
    `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Interpolate false /Length ${image.length} >>`,
    image,
  );
  object(5, `<< /Length ${content.length} >>`, content);

  const xref = length;
  const entries = offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`);
  push(`xref\n0 ${offsets.length}\n0000000000 65535 f \n${entries.join("")}`);
  push(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const pdf = new Uint8Array(length);
  let at = 0;
  for (const part of parts) {
    pdf.set(part, at);
    at += part.length;
  }
  return pdf;
}

/** PDF dari kanvas lembar: RGBA kanvas diubah menjadi RGB, lalu pdfFromRgb. */
export async function canvasToPdf(canvas: HTMLCanvasElement): Promise<Blob> {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Kanvas tidak bisa dibaca");
  const { width: w, height: h } = canvas;
  const rgba = context.getImageData(0, 0, w, h).data;
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i];
    rgb[j + 1] = rgba[i + 1];
    rgb[j + 2] = rgba[i + 2];
  }
  return new Blob([(await pdfFromRgb(w, h, rgb)) as BlobPart], { type: "application/pdf" });
}
