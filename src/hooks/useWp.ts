/**
 * useWP.ts — Hook untuk menghitung WP dari data Supabase
 *
 * Cara pakai:
 *   const { results, loading } = useWP();
 *   // results sudah diurutkan ranking 1 = terbaik
 */

import { useMemo } from "react";
import { useKost } from "../contexts/KostContext"; // sesuaikan path context kamu
import { hitungWP, type KostInput } from "../lib/wp";
import { haversineKm } from "../contexts/KostContext";

// Koordinat referensi kampus (sesuai yang ada di KostModal)
const LAT_KAMPUS = -6.3436;
const LNG_KAMPUS = 106.7745;

export function useWP() {
  const { kostList } = useKost();

  const results = useMemo(() => {
    if (!kostList || kostList.length === 0) return [];

    // Mapping dari Kost (DB) → KostInput (WP)
    const inputs: KostInput[] = kostList.map((k) => ({
      id: String(k.id),
      nama: k.nama,
      harga: k.harga, // sudah dalam rupiah penuh
      jarak:
        k.lat != null && k.lng != null
          ? haversineKm(LAT_KAMPUS, LNG_KAMPUS, k.lat, k.lng)
          : 99, // fallback: sangat jauh jika koordinat kosong
      fasilitas: k.fasilitas, // sudah skala 1–5 dari DB
      keamanan: k.keamanan,
      kebersihan: k.kebersihan,
      rating: k.rating,
      akses: k.akses,
    }));

    return hitungWP(inputs);
  }, [kostList]);

  return { results };
}
