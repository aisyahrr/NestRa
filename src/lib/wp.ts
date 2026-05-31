/**
 * Weighted Product (WP) - SPK Pemilihan Kost Terbaik
 * Sesuai perhitungan manual Excel
 *
 * Kriteria:
 *  C1 Harga      - Cost    - bobot 0.25
 *  C2 Jarak      - Cost    - bobot 0.20
 *  C3 Fasilitas  - Benefit - bobot 0.20
 *  C4 Keamanan   - Benefit - bobot 0.15
 *  C5 Kebersihan - Benefit - bobot 0.10
 *  C6 Rating     - Benefit - bobot 0.05
 *  C7 Akses      - Benefit - bobot 0.05
 */

// ─── Tipe Data 

export interface KostInput {
  id: string;
  nama: string;
  harga: number;        // dalam rupiah penuh (sudah * 1000 dari modal)
  jarak: number;        // km, dari haversine
  fasilitas: number;    // skala 1–5 (dihitung dari hitungFasilitas)
  keamanan: number;     // 1–5
  kebersihan: number;   // 1–5
  rating: number;       // 1–5
  akses: number;        // 1–5
}

export interface WPResult {
  id: string;
  nama: string;
  /** Nilai skala 1–5 tiap kriteria setelah konversi */
  nilaiC1: number;
  nilaiC2: number;
  nilaiC3: number;
  nilaiC4: number;
  nilaiC5: number;
  nilaiC6: number;
  nilaiC7: number;
  /** Vektor S (perkalian pangkat) */
  vectorS: number;
  /** Vektor V (preferensi relatif) */
  vectorV: number;
  /** Ranking 1 = terbaik */
  ranking: number;
}

// ─── Bobot Kriteria 

const BOBOT = {
  C1: 0.25,  // Harga      - Cost
  C2: 0.20,  // Jarak      - Cost
  C3: 0.20,  // Fasilitas  - Benefit
  C4: 0.15,  // Keamanan   - Benefit
  C5: 0.10,  // Kebersihan - Benefit
  C6: 0.05,  // Rating     - Benefit
  C7: 0.05,  // Akses      - Benefit
} as const;

// ─── Step 1: Konversi Nilai ke Skala 1–5 
/**
 * C1 - Harga (Cost)
 * ≥ 2.000.000        → 1 (Sangat mahal)
 * 1.700.000–1.999.999 → 2 (Mahal)
 * 1.500.000–1.699.999 → 3 (Cukup mahal)
 * 1.000.000–1.499.999 → 4 (Terjangkau)
 * ≤ 999.999           → 5 (Sangat murah)
 */
function nilaiHarga(harga: number): number {
  if (harga >= 2_000_000) return 1;
  if (harga >= 1_700_000) return 2;
  if (harga >= 1_500_000) return 3;
  if (harga >= 1_000_000) return 4;
  return 5;
}

/**
 * C2 - Jarak (Cost)
 * ≥ 3 km      → 1 (Jauh)
 * 2–3 km      → 2 (Lumayan jauh)
 * 1–2 km      → 3 (Cukup dekat)
 * 0.5–1 km    → 4 (Dekat)
 * ≤ 0.5 km    → 5 (Sangat dekat)
 */
function nilaiJarak(jarak: number): number {
  if (jarak >= 3) return 1;
  if (jarak >= 2) return 2;
  if (jarak >= 1) return 3;
  if (jarak >= 0.5) return 4;
  return 5;
}

/**
 * C3 - Fasilitas (Benefit) → sudah skala 1–5 dari hitungFasilitas()
 * Total bobot fasilitas:
 *   Fasilitas Kamar × 2 + Fasilitas Umum × 1
 *   ≤ 12  → 1 (Sangat minim)
 *   13–17 → 2 (Kurang)
 *   18–21 → 3 (Cukup)
 *   22–25 → 4 (Lengkap)
 *   ≥ 26  → 5 (Sangat lengkap)
 *
 * Nilai fasilitas sudah disimpan di DB, langsung pakai.
 */
function nilaiFasilitas(fasilitas: number): number {
  return Math.max(1, Math.min(5, fasilitas));
}

// C4 Keamanan, C5 Kebersihan, C6 Rating, C7 Akses
// sudah diinput langsung sebagai skala 1–5 dari form modal
function nilaiDirect(val: number): number {
  return Math.max(1, Math.min(5, Math.round(val)));
}

// ─── Step 2: Hitung Vektor S 

/**
 * S_i = ∏ (nilai_j ^ W_j)
 * - Benefit: pangkat +W
 * - Cost:    pangkat -W  (membalik pengaruh, nilai tinggi = buruk)
 */
function hitungVectorS(
  c1: number, c2: number, c3: number,
  c4: number, c5: number, c6: number, c7: number
): number {
  return (
    Math.pow(c1, -BOBOT.C1) *  // Cost: negatif
    Math.pow(c2, -BOBOT.C2) *  // Cost: negatif
    Math.pow(c3,  BOBOT.C3) *  // Benefit: positif
    Math.pow(c4,  BOBOT.C4) *  // Benefit: positif
    Math.pow(c5,  BOBOT.C5) *  // Benefit: positif
    Math.pow(c6,  BOBOT.C6) *  // Benefit: positif
    Math.pow(c7,  BOBOT.C7)    // Benefit: positif
  );
}

// ─── Step 3: Hitung Vektor V (Preferensi)

/**
 * V_i = S_i / Σ S_semua
 * Nilai 0–1, semakin besar semakin direkomendasikan
 */
function hitungVectorV(si: number, totalS: number): number {
  return si / totalS;
}

// ─── Fungsi Utama: Hitung WP 

export function hitungWP(kosts: KostInput[]): WPResult[] {
  if (kosts.length === 0) return [];

  // Step 1: Konversi semua nilai ke skala 1–5
  const converted = kosts.map((k) => ({
    id: k.id,
    nama: k.nama,
    c1: nilaiHarga(k.harga),
    c2: nilaiJarak(k.jarak),
    c3: nilaiFasilitas(k.fasilitas),
    c4: nilaiDirect(k.keamanan),
    c5: nilaiDirect(k.kebersihan),
    c6: nilaiDirect(k.rating),
    c7: nilaiDirect(k.akses),
  }));

  // Step 2: Hitung Vektor S tiap alternatif
  const withS = converted.map((k) => ({
    ...k,
    vectorS: hitungVectorS(k.c1, k.c2, k.c3, k.c4, k.c5, k.c6, k.c7),
  }));

  // Step 3: Total S untuk normalisasi
  const totalS = withS.reduce((sum, k) => sum + k.vectorS, 0);

  // Step 4: Hitung Vektor V dan buat hasil
  const results: WPResult[] = withS.map((k) => ({
    id: k.id,
    nama: k.nama,
    nilaiC1: k.c1,
    nilaiC2: k.c2,
    nilaiC3: k.c3,
    nilaiC4: k.c4,
    nilaiC5: k.c5,
    nilaiC6: k.c6,
    nilaiC7: k.c7,
    vectorS: k.vectorS,
    vectorV: hitungVectorV(k.vectorS, totalS),
    ranking: 0, // diisi setelah sort
  }));

  // Step 5: Sort descending berdasarkan V, assign ranking
  results.sort((a, b) => b.vectorV - a.vectorV);
  results.forEach((r, i) => {
    r.ranking = i + 1;
  });

  return results;
}

// ─── Fungsi Bantu: Hitung Fasilitas (sama persis dengan KostModal) ─────────────

/**
 * Dipanggil saat menyimpan kost, hasilnya (skala) disimpan ke DB sebagai `fasilitas`.
 * Rumus: (jumlah item kamar × 2) + (jumlah item umum × 1)
 * Skala:
 *  ≤ 12  → 1
 *  13–17 → 2
 *  18–21 → 3
 *  22–25 → 4
 *  ≥ 26  → 5
 */
export function hitungSkalaFasilitas(
  fasilitasKamar: string,
  fasilitasUmum: string
): { total: number; skala: number; detail: string } {
  const listKamar = fasilitasKamar
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
  const listUmum = fasilitasUmum
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  const total = listKamar.length * 2 + listUmum.length * 1;

  let skala: number;
  if (total <= 12) skala = 1;
  else if (total <= 17) skala = 2;
  else if (total <= 21) skala = 3;
  else if (total <= 25) skala = 4;
  else skala = 5;

  return {
    total,
    skala,
    detail: [...listKamar, ...listUmum].join(", "),
  };
}