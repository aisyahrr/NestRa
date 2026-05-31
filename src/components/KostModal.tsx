import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Kost, UNPAM_VIKTOR } from "@/contexts/KostContext";
import { haversineKm } from "@/contexts/KostContext";
import { supabase } from "@/lib/supabase";

interface KostModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Kost, "id" | "jarak">) => void;
  initial?: Kost | null;
}

type FormState = {
  nama: string;
  harga: number | string;
  keamanan: number | string;
  kebersihan: number | string;
  akses: number | string;
  rating: number | string;
  alamat?: string;
  lat?: number | null;
  lng?: number | null;
};

export function KostModal({ open, onClose, onSave, initial }: KostModalProps) {
  const [form, setForm] = useState<FormState>(() => {
    if (initial) {
      return {
        nama: initial.nama ?? "",
        harga: initial.harga ?? "",
        keamanan: initial.keamanan ?? "",
        kebersihan: initial.kebersihan ?? "",
        akses: initial.akses ?? "",
        rating: initial.rating ?? "",
        alamat: initial.alamat ?? "",
        lat: initial.lat ?? null,
        lng: initial.lng ?? null,
      };
    }
    return {
      nama: "",
      harga: "",
      keamanan: "",
      kebersihan: "",
      akses: "",
      rating: "",
      alamat: "",
      lat: null,
      lng: null,
    };
  });

  const [file, setFile] = useState<File | null>(() => null);

  const [fasilitasKamar, setFasilitasKamar] = useState(() => {
    if (initial?.fasilitas_detail) {
      const [kamarPart] = initial.fasilitas_detail.split("|");
      return kamarPart ?? "";
    }
    return "";
  });

  const [fasilitasUmum, setFasilitasUmum] = useState(() => {
    if (initial?.fasilitas_detail) {
      const [, umumPart] = initial.fasilitas_detail.split("|");
      return umumPart ?? "";
    }
    return "";
  });

  const set = (
    key: keyof Omit<Kost, "id" | "image">,
    val: string | number | null,
  ) => setForm((f) => ({ ...f, [key]: val }));

  // ✅ Range sesuai tabel C3 Excel
  function hitungFasilitas(kamar: string, umum: string) {
    const listKamar = kamar.split(",").map((i) => i.trim()).filter(Boolean);
    const listUmum  = umum.split(",").map((i) => i.trim()).filter(Boolean);

    const total = listKamar.length * 2 + listUmum.length * 1;

    let skala: number;
    if      (total <= 12) skala = 1; // Sangat minim
    else if (total <= 17) skala = 2; // Kurang
    else if (total <= 21) skala = 3; // Cukup
    else if (total <= 25) skala = 4; // Lengkap
    else                  skala = 5; // Sangat lengkap

    return {
      total,
      skala,
      // ✅ Simpan dengan "|" sebagai pemisah kamar vs umum
      detail: `${kamar.trim()}|${umum.trim()}`,
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { skala, detail } = hitungFasilitas(fasilitasKamar, fasilitasUmum);
      const imageUrl = await uploadImage(file);

      const kostData = {
        nama: form.nama,
        harga: Number(form.harga),
        fasilitas: skala,
        keamanan: Number(form.keamanan),
        kebersihan: Number(form.kebersihan),
        akses: Number(form.akses),
        rating: Number(form.rating),
        alamat: form.alamat || "",
        lat: form.lat !== null ? Number(form.lat) : null,
        lng: form.lng !== null ? Number(form.lng) : null,
        fasilitas_detail: detail,
        image: imageUrl || initial?.image || "",
      };

      await onSave(kostData);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  async function uploadImage(file: File | null) {
    if (!file) return null;

    const fileName = `kost-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("kost-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("kost-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-xl rounded-xl bg-card border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-bold">
                  {initial ? "Edit Kost" : "Tambah Kost Baru"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Gambar */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gambar Kost</label>

                  {file && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-40 object-cover rounded-xl border"
                        alt="preview"
                      />
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                      >
                        Hapus
                      </button>
                    </div>
                  )}

                  {!file && initial?.image && (
                    <div className="relative">
                      <img
                        src={initial.image}
                        className="w-full h-40 object-cover rounded-xl border opacity-60"
                        alt="gambar saat ini"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Gambar saat ini
                      </span>
                    </div>
                  )}

                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition">
                    <span className="text-sm text-muted-foreground">
                      {file ? "Ganti gambar" : "Upload gambar"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) setFile(selected);
                      }}
                    />
                  </label>
                </div>

                {/* Nama */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Nama Kos
                  </label>
                  <input
                    required
                    value={form.nama}
                    onChange={(e) => set("nama", e.target.value)}
                    className="w-full rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Harga & Jarak */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Harga / bulan (ribuan Rp)
                    </label>
                    <input
                      required
                      type="number"
                      min={0}
                      value={form.harga || ""}
                      onChange={(e) => set("harga", Number(e.target.value))}
                      className="w-full rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Jarak — otomatis dari koordinat
                    </label>
                    <input
                      type="text"
                      value={
                        form.lat && form.lng
                          ? `${haversineKm(
                              UNPAM_VIKTOR.lat,
                              UNPAM_VIKTOR.lng,
                              Number(form.lat),
                              Number(form.lng),
                            ).toFixed(2)} km`
                          : "-"
                      }
                      disabled
                      className="w-full rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground opacity-70"
                    />
                  </div>
                </div>

                {/* Alamat */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Alamat (opsional)
                  </label>
                  <input
                    value={form.alamat || ""}
                    onChange={(e) => set("alamat", e.target.value)}
                    placeholder="Jl. Surya Kencana, Pamulang"
                    className="w-full rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Fasilitas Kamar */}
                <div>
                  <label className="text-sm font-medium">Fasilitas Kamar</label>
                  <p className="text-xs text-muted-foreground mb-1">
                    Pisahkan dengan koma. Tiap item bernilai 2 poin.
                  </p>
                  <input
                    type="text"
                    placeholder="Kasur, AC, Lemari, Meja, Kursi"
                    value={fasilitasKamar}
                    onChange={(e) => setFasilitasKamar(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Fasilitas Umum */}
                <div>
                  <label className="text-sm font-medium">Fasilitas Umum</label>
                  <p className="text-xs text-muted-foreground mb-1">
                    Pisahkan dengan koma. Tiap item bernilai 1 poin.
                  </p>
                  <input
                    type="text"
                    placeholder="WiFi, Dapur, CCTV, Parkir"
                    value={fasilitasUmum}
                    onChange={(e) => setFasilitasUmum(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Kebersihan & Akses */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Kebersihan
                    </label>
                    <select
                      value={form.kebersihan}
                      onChange={(e) => set("kebersihan", Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value={1}>1 — Kotor</option>
                      <option value={2}>2 — Kurang bersih</option>
                      <option value={3}>3 — Cukup bersih</option>
                      <option value={4}>4 — Bersih</option>
                      <option value={5}>5 — Sangat bersih</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Akses
                    </label>
                    <select
                      value={form.akses}
                      onChange={(e) => set("akses", Number(e.target.value))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value={1}>1 — Sulit / sempit</option>
                      <option value={2}>2 — Motor saja</option>
                      <option value={3}>3 — Motor + Sepeda</option>
                      <option value={4}>4 — Mobil + Motor</option>
                      <option value={5}>5 — Mobil + Motor (luas)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">               
                    {/* Keamanan */}
                    <div>
                      <label className="text-sm font-medium">Keamanan</label>
                      <select
                        value={form.keamanan}
                        onChange={(e) => set("keamanan", Number(e.target.value))}
                        className="w-full mt-1 rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={1}>1 — Tidak ada</option>
                        <option value={2}>2 — Penjaga saja</option>
                        <option value={3}>3 — CCTV saja</option>
                        <option value={4}>4 — CCTV + Penjaga</option>
                        <option value={5}>5 — CCTV + Penjaga + Akses</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Rating</label>
                      <select
                        value={form.rating}
                        onChange={(e) => set("rating", Number(e.target.value))}
                        className="w-full mt-1 rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={1}>1 — Sangat rendah</option>
                        <option value={2}>2 — Rendah</option>
                        <option value={3}>3 — Cukup</option>
                        <option value={4}>4 — Tinggi</option>
                        <option value={5}>5 — Sangat tinggi</option>
                      </select>
                  </div>
                </div>
                    

                {/* Koordinat */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="-6.3436"
                      value={form.lat ?? ""}
                      onChange={(e) =>
                        set("lat", e.target.value === "" ? null : Number(e.target.value))
                      }
                      className="w-full rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="106.7745"
                      value={form.lng ?? ""}
                      onChange={(e) =>
                        set("lng", e.target.value === "" ? null : Number(e.target.value))
                      }
                      className="w-full rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                {/* Tombol */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}