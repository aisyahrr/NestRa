import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { updateKost as updateKostService } from "../services/kost.service";

// ─── Koordinat Kampus ────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const UNPAM_VIKTOR = {
  name: "Universitas Pamulang — Kampus Viktor",
  lat: -6.347319,
  lng: 106.728007,
};

// ─── Tipe Data ────────────────────────────────────────────────────────────────

export interface Kost {
  id: string;
  nama: string;
  harga: number;
  jarak: number;
  fasilitas: number;
  keamanan: number;
  kebersihan: number;
  rating: number;
  akses: number;
  image?: string;
  lat: number | null;
  lng: number | null;
  alamat?: string;
  fasilitas_detail: string;
}

interface KostContextType {
  kostList: Kost[];
  addKost: (kost: Omit<Kost, "id" | "jarak">) => Promise<void>;
  updateKost: (id: string, kost: Omit<Kost, "id" | "jarak">) => Promise<void>;
  deleteKost: (id: string) => Promise<void>;
}

// ─── Haversine ────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function withDistance<T extends { lat?: number | null; lng?: number | null }>(
  k: T,
): T & { jarak: number } {
  if (k.lat != null && k.lng != null) {
    return {
      ...k,
      jarak:
        Math.round(
          haversineKm(UNPAM_VIKTOR.lat, UNPAM_VIKTOR.lng, k.lat, k.lng) * 100,
        ) / 100,
    };
  }
  return { ...k, jarak: 9999 };
}

// ─── Konversi Nilai ke Skala 1–5 (Sesuai Tabel Excel) ────────────────────────

/**
 * C1 — Harga (Cost)
 * ≥ 2.000.000          → 1  Sangat mahal
 * 1.700.001–1.999.999  → 2  Mahal
 * 1.500.001–1.700.000  → 3  Cukup mahal
 * 1.000.001–1.500.000  → 4  Terjangkau
 * ≤ 1.000.000          → 5  Sangat murah
 */
function convertHarga(harga: number): number {
  if (harga >= 2_000_000) return 1;
  if (harga >= 1_700_000) return 2;
  if (harga >= 1_500_000) return 3;
  if (harga >= 1_000_000) return 4;
  return 5;
}

/**
 * C2 — Jarak (Cost)
 * ≥ 3 km       → 1  Jauh
 * 2–2.99 km    → 2  Lumayan jauh
 * 1–1.99 km    → 3  Cukup dekat
 * 0.5–0.99 km  → 4  Dekat
 * < 0.5 km     → 5  Sangat dekat
 */
function convertJarak(jarak: number): number {
  if (jarak >= 3) return 1;
  if (jarak >= 2) return 2;
  if (jarak >= 1) return 3;
  if (jarak >= 0.5) return 4;
  return 5;
}

/**
 * C3 — Fasilitas (Benefit)
 * Sudah dihitung dan disimpan di DB sebagai skala 1–5.
 * Rumus di KostModal: (jml fasilitas kamar × 2) + (jml fasilitas umum × 1)
 *   ≤ 12  → 1  Sangat minim
 *   13–17 → 2  Kurang
 *   18–21 → 3  Cukup
 *   22–25 → 4  Lengkap
 *   ≥ 26  → 5  Sangat lengkap
 * Langsung pakai nilai dari DB, clamp 1–5.
 */
function convertFasilitas(fasilitas: number): number {
  return Math.max(1, Math.min(5, Math.round(fasilitas)));
}

/**
 * C4 — Keamanan (Benefit)
 * Diinput langsung dari form sebagai 1–5.
 * 1 Tidak ada  2 Penjaga saja  3 CCTV saja
 * 4 CCTV+Penjaga  5 CCTV+Penjaga+Akses
 */
function convertKeamanan(keamanan: number): number {
  return Math.max(1, Math.min(5, Math.round(keamanan)));
}

/**
 * C5 — Kebersihan (Benefit)
 * Diinput langsung dari form sebagai 1–5.
 * 1 Kotor  2 Kurang bersih  3 Cukup bersih
 * 4 Bersih  5 Sangat bersih
 */
function convertKebersihan(kebersihan: number): number {
  return Math.max(1, Math.min(5, Math.round(kebersihan)));
}

/**
 * C6 — Rating (Benefit)
 * Di sistem ini rating adalah bintang 1–5 yang diinput user (bukan desimal Google Maps).
 * Sesuai tabel Excel C6: nilai 1–5 langsung.
 * 1 Sangat rendah  2 Rendah  3 Cukup  4 Tinggi  5 Sangat tinggi
 *
 * Jika kamu menyimpan rating sebagai desimal (misal 4.5),
 *     gunakan convertRatingDesimal() di bawah sebagai gantinya.
 */
function convertRating(rating: number): number {
  return Math.max(1, Math.min(5, Math.round(rating)));
}

/**
 * C6 — Rating versi desimal (opsional, aktifkan jika rating disimpan sebagai 0.0–5.0)
 * < 4.0        → 1  Sangat rendah
 * 4.0–4.29     → 2  Rendah
 * 4.3–4.59     → 3  Cukup
 * 4.6–4.79     → 4  Tinggi
 * ≥ 4.8        → 5  Sangat tinggi
 */
// eslint-disable-next-line react-refresh/only-export-components
export function convertRatingDesimal(rating: number): number {
  if (rating >= 4.8) return 5;
  if (rating >= 4.6) return 4;
  if (rating >= 4.3) return 3;
  if (rating >= 4.0) return 2;
  return 1;
}

/**
 * C7 — Akses (Benefit)
 * Diinput langsung dari form sebagai 1–5.
 * 1 Sulit/sempit  2 Motor saja  3 Motor+Sepeda
 * 4 Mobil+Motor  5 Mobil+Motor (luas)
 */
function convertAkses(akses: number): number {
  return Math.max(1, Math.min(5, Math.round(akses)));
}

// ─── Bobot WP ─────────────────────────────────────────────────────────────────

/**
 * Bobot sesuai Tabel Bobot Kriteria di Excel.
 * Cost  → pangkat negatif (−W)
 * Benefit → pangkat positif (+W)
 *
 *  C1 Harga      Cost    −0.25
 *  C2 Jarak      Cost    −0.20
 *  C3 Fasilitas  Benefit +0.20
 *  C4 Keamanan   Benefit +0.15
 *  C5 Kebersihan Benefit +0.10
 *  C6 Rating     Benefit +0.05
 *  C7 Akses      Benefit +0.05
 */

// ─── Tipe Hasil WP ────────────────────────────────────────────────────────────

export interface WPResult extends Kost {
  /** Nilai skala 1–5 setelah konversi, untuk ditampilkan di tabel */
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  c6: number;
  c7: number;
  /** Vektor S = ∏(nilai_j ^ bobot_j) */
  S: number;
  /** Vektor V = S_i / ΣS  → semakin besar semakin baik */
  V: number;
}

// ─── Fungsi Utama: calculateWP ────────────────────────────────────────────────
export interface WPWeights {
  harga: number;
  jarak: number;
  fasilitas: number;
  keamanan: number;
  kebersihan: number;
  rating: number;
  akses: number;
}
// eslint-disable-next-line react-refresh/only-export-components
export function calculateWP(kostList: Kost[], weights?: WPWeights): WPResult[] {
  if (!Array.isArray(kostList) || kostList.length === 0) return [];
  const w = weights
    ? [
        -(weights.harga / 100),
        -(weights.jarak / 100),
        weights.fasilitas / 100,
        weights.keamanan / 100,
        weights.kebersihan / 100,
        weights.rating / 100,
        weights.akses / 100,
      ]
    : [-0.25, -0.2, 0.2, 0.15, 0.1, 0.05, 0.05];
  // Step 1: konversi tiap kriteria ke skala 1–5
  const mapped = kostList.filter(Boolean).map((k) => ({
    ...k,
    c1: convertHarga(k.harga || 0),
    c2: convertJarak(k.jarak || 9999),
    c3: convertFasilitas(k.fasilitas || 1),
    c4: convertKeamanan(k.keamanan || 1),
    c5: convertKebersihan(k.kebersihan || 1),
    c6: convertRating(k.rating || 1),
    c7: convertAkses(k.akses || 1),
  }));

  // Step 2: hitung Vektor S tiap alternatif
  //   S_i = c1^(-0.25) × c2^(-0.20) × c3^(0.20) × c4^(0.15) × c5^(0.10) × c6^(0.05) × c7^(0.05)
  const sValues = mapped.map((k) => {
    const criteria = [k.c1, k.c2, k.c3, k.c4, k.c5, k.c6, k.c7];
    return criteria.reduce(
      (acc, val, i) => acc * Math.pow(Math.max(val, 1), w[i]),
      1,
    );
  });

  // Step 3: total S untuk normalisasi
  const totalS = sValues.reduce((a, b) => a + b, 0);
  if (totalS === 0) return [];

  // Step 4: hitung Vektor V, sort descending
  return mapped
    .map((k, i) => ({
      ...k,
      S: sValues[i],
      V: sValues[i] / totalS,
    }))
    .sort((a, b) => b.V - a.V);
}

// ─── Fungsi Bantu Fasilitas (dipakai di KostModal) ───────────────────────────

/**
 * Hitung skala fasilitas dari string input form.
 * Sesuai tabel C3 di Excel:
 *   Total = (item kamar × 2) + (item umum × 1)
 *   ≤ 12  → 1   13–17 → 2   18–21 → 3   22–25 → 4   ≥ 26 → 5
 */
// eslint-disable-next-line react-refresh/only-export-components
export function hitungSkalaFasilitas(
  fasilitasKamar: string,
  fasilitasUmum: string,
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

  return { total, skala, detail: [...listKamar, ...listUmum].join(", ") };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const KostContext = createContext<KostContextType | null>(null);

export function KostProvider({ children }: { children: ReactNode }) {
  const [kostList, setKostList] = useState<Kost[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchKost();
  }, []);

  const fetchKost = async () => {
    const { data, error } = await supabase.from("kost").select("*");
    if (error) {
      console.error(error);
      return;
    }
    setKostList((data || []).filter(Boolean).map(withDistance));
  };

  const addKost = async (kost: Omit<Kost, "id" | "jarak">) => {
    const payload = {
      ...kost,
      harga: Number(kost.harga),
      fasilitas: Number(kost.fasilitas),
      keamanan: Number(kost.keamanan),
      kebersihan: Number(kost.kebersihan),
      akses: Number(kost.akses),
      rating: Number(kost.rating),
      lat: kost.lat ? Number(kost.lat) : null,
      lng: kost.lng ? Number(kost.lng) : null,
    };
    const { data, error } = await supabase
      .from("kost")
      .insert([payload])
      .select();
    if (error) {
      console.error(error);
      return;
    }
    setKostList((prev) => [...prev, ...(data || []).map(withDistance)]);
  };

  const updateKost = async (id: string, kost: Omit<Kost, "id" | "jarak">) => {
    const updatedData = await updateKostService(id, kost);

    const updated = withDistance(updatedData);

    setKostList((prev) => prev.map((k) => (k.id === id ? updated : k)));
  };

  const deleteKost = async (id: string) => {
    const { error } = await supabase.from("kost").delete().eq("id", id);
    if (error) {
      console.error(error);
      throw error;
    }
    setKostList((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <KostContext.Provider value={{ kostList, addKost, updateKost, deleteKost }}>
      {children}
    </KostContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useKost() {
  const ctx = useContext(KostContext);
  if (!ctx) throw new Error("useKost must be used within KostProvider");
  return ctx;
}
