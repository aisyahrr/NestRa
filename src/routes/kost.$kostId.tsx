import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useKost, UNPAM_VIKTOR } from "@/contexts/KostContext";
import { lazy, Suspense } from "react";

import { StarRating } from "@/components/StarRating";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  Banknote,
  Shield,
  Sparkles,
  Home,
  Star,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { KostModal } from "@/components/KostModal";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { calculateWP } from "@/contexts/KostContext";
import { KostMap } from "@/components/KostMapLeaflet";

export const Route = createFileRoute("/kost/$kostId")({
  component: DetailKost,
  notFoundComponent: () => (
    <div className="text-center py-16">
      <Home size={48} className="mx-auto mb-4 text-muted-foreground/40" />
      <h2 className="font-heading text-2xl font-bold mb-2">
        Kost tidak ditemukan
      </h2>
      <Link to="/data-kost" className="text-primary hover:underline text-sm">
        ← Kembali ke Data Kost
      </Link>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Detail Kost — KostSPK" },
      {
        name: "description",
        content: "Detail lengkap kost: harga, fasilitas, lokasi, dan rating",
      },
    ],
  }),
});

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function DetailKost() {
  const { kostId } = Route.useParams();
  const { kostList, updateKost, deleteKost } = useKost();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const ranking = calculateWP(kostList);

  const rankedKost = ranking.map((k, i) => ({
    ...k,
    rank: i,
  }));
  const kost = rankedKost.find((k) => k.id === kostId);
  if (!kost) throw notFound();

  // Skor agregat sederhana (rata-rata dari 4 kriteria 1-5)
  const totalScore = (
    (kost.fasilitas +
      kost.keamanan +
      kost.kebersihan +
      kost.rating +
      kost.akses) /
    5
  ).toFixed(2);

  const criteria = [
    {
      label: "Fasilitas",
      value: kost.fasilitas,
      icon: Sparkles,
      bg: "bg-pastel-blue",
    },
    {
      label: "Keamanan",
      value: kost.keamanan,
      icon: Shield,
      bg: "bg-pastel-green",
    },
    {
      label: "Kebersihan",
      value: kost.kebersihan,
      icon: Sparkles,
      bg: "bg-pastel-pink",
    },
    { label: "Akses", value: kost.akses, icon: Sparkles, bg: "bg-pastel-blue" },
    {
      label: "Rating Umum",
      value: kost.rating,
      icon: Star,
      bg: "bg-pastel-yellow",
    },
  ];

  const handleDelete = () => {
    if (confirm(`Hapus ${kost.nama}?`)) {
      deleteKost(kost.id);
      toast.success("Kost berhasil dihapus!");
      navigate({ to: "/data-kost" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back & actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/data-kost"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 text-sm font-medium hover:bg-destructive/20 transition-colors"
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-border bg-card"
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-full bg-muted">
            {kost.image ? (
              <img
                src={kost.image}
                alt={kost.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home size={64} className="text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute top-4 left-4 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-sm font-bold shadow-sm">
              {formatRupiah(kost.harga)}
              <span className="text-xs font-normal text-foreground/60">
                /bln
              </span>
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground leading-tight">
                {kost.nama}
              </h1>
              {kost.alamat && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" /> {kost.alamat}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <StarRating value={kost.rating} size={20} />
              <span className="text-sm text-muted-foreground">
                {kost.rating.toFixed(1)} / 5.0
              </span>
            </div>

            <div className="rounded-xl bg-pastel-yellow/60 border border-border p-4">
              <p className="text-xs text-foreground/60 uppercase tracking-wider font-semibold mb-1">
                Skor Total
              </p>
              <p className="font-heading text-3xl font-bold text-foreground">
                {totalScore}
                <span className="text-sm font-normal text-muted-foreground">
                  /5.0
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <GraduationCap size={18} className="text-primary" />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase">
                    Jarak ke Kampus
                  </p>
                  <p className="text-sm font-bold">{kost.jarak} km</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <Banknote size={18} className="text-primary" />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase">
                    Harga / bulan
                  </p>
                  <p className="text-sm font-bold">
                    {formatRupiah(kost.harga)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Penilaian Kriteria */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="font-heading text-xl font-semibold mb-5">
          Penilaian Kriteria
        </h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {criteria.map((c) => (
            <div key={c.label} className={`rounded-xl ${c.bg} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <c.icon size={16} className="text-foreground/70" />
                  <span className="text-sm font-semibold text-foreground">
                    {c.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {c.value}/5
                </span>
              </div>
              <div className="h-2 rounded-full bg-card/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary animate-score-fill"
                  style={
                    {
                      "--score-width": `${(c.value / 5) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lokasi */}
      {kost.lat !== undefined && kost.lng !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">Lokasi</h2>
            <span className="text-xs text-muted-foreground">
              {kost.jarak} km dari {UNPAM_VIKTOR.name}
            </span>
          </div>
          <Suspense fallback={<div>Loading map...</div>}>
            <KostMap kostList={rankedKost} height="380px" />
          </Suspense>
        </motion.div>
      )}

      <KostModal
        key={editOpen ? (kost.id ?? "edit") : "closed"}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => {
          updateKost(kost.id, data);
          toast.success("Kost berhasil diperbarui!");
        }}
        initial={kost}
      />
    </div>
  );
}
