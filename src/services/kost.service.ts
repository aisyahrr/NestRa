import { supabase } from "@/lib/supabase";
import type { Kost } from "@/contexts/KostContext";

export async function getKosts(): Promise<Kost[]> {
    const { data, error } = await supabase
        .from("kost")
        .select("*");

    if (error) {
        console.error(error);
        throw error;
    }

    return data || [];
}

export async function createKost(data: Omit<Kost, "id">) {
    const { error } = await supabase
        .from("kost")
        .insert([data]);

    if (error) {
        console.error(error);
        throw error;
    }
}

export async function updateKost(
  id: string,
  kost: Omit<Kost, "id" | "jarak">
) {
  console.log("UPDATE ID:", id);

  const payload = {
    ...kost,
    harga: Number(kost.harga),
    fasilitas: Number(kost.fasilitas),
    keamanan: Number(kost.keamanan),
    kebersihan: Number(kost.kebersihan),
    akses: Number(kost.akses),
    rating: Number(kost.rating),
    lat: kost.lat !== null ? Number(kost.lat) : null,
    lng: kost.lng !== null ? Number(kost.lng) : null,
  };

  console.log("PAYLOAD:", payload);

  const { data, error } = await supabase
    .from("kost")
    .update(payload)
    .eq("id", id)
    .select();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error(`Tidak ada data yang ter-update. ID = ${id}`);
  }

  return data[0];
}
export async function deleteKost(id: string) {
    const { error } = await supabase
        .from("kost")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        throw error;
    }
}