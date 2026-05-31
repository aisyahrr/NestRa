import { KostMap } from "@/components/KostMapLeaflet";
import { calculateWP, UNPAM_VIKTOR, useKost } from "@/contexts/KostContext";
import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, MapPin, TrendingUp } from "lucide-react";
import { useState } from "react";
const cardStyles = [
  {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    badge: "bg-pink-100 text-pink-700",
  },
];
export const Route = createFileRoute("/peta")({
  component: PetaPage,
  head: () => ({
    meta: [
      { title: "Peta Kost — KostSPK" },
      { name: "description", content: "Cari kost terbaik dan terdekat dari Universitas Pamulang Viktor" },
    ],
  }),
});

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function PetaPage() {
  const { kostList } = useKost();
  const [maxKm, setMaxKm] = useState(3);

  // Filter kost yang punya koordinat dan dalam radius
  const filtered = kostList.filter(
    (k) => k.lat != null && k.lng != null && k.jarak != null && k.jarak <= maxKm
  );

  // Ranking pakai WP
  const ranking = calculateWP(filtered).map((k, i) => ({ ...k, rank: i }));

  const top3 = ranking.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Peta Kost</h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-1.5">
            <GraduationCap size={15} className="text-primary" />
            Pusat: {UNPAM_VIKTOR.name}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-border bg-pastel-blue/40 p-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2 block">
            Radius Maksimum: <span className="text-foreground">{maxKm} km</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={maxKm}
            onChange={(e) => setMaxKm(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      {/* Map */}
      <ClientOnly fallback={
        <div className="h-125 rounded-2xl border border-border flex items-center justify-center">
          Memuat peta...
        </div>
      }>
        <KostMap kostList={ranking} height="500px" />
      </ClientOnly>
      {/* Top 3 */}
      <div>
        <h2 className="font-heading text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          3 Kost Terbaik (Metode WP)
        </h2>

        {top3.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-2xl border border-dashed border-border">
            <MapPin size={40} className="mx-auto mb-3 opacity-30" />
            <p>
              Tidak ada kost dalam radius {maxKm} km. Tambah radius atau tambah
              data kost dengan koordinat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((k, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const style = cardStyles[i];

              return (
                <motion.div
                  key={k.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border border-border ${style.bg} p-5 card-lift`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{medals[i]}</span>
                    <span className={`rounded-full ${style.badge} px-2.5 py-1 text-xs font-bold`}>
                      V = {k.V.toFixed(4)}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    <Link
                      to="/kost/$kostId"
                      params={{ kostId: k.id }}
                      className="hover:text-primary hover:underline transition-colors "
                    >
                      {k.nama}
                    </Link>
                  </h3>

                  {k.alamat && (
                    <p className="text-xs text-foreground/60 mb-3">{k.alamat}</p>
                  )}

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/60 flex items-center gap-1">
                        <MapPin size={13} /> Jarak
                      </span>
                      <span className="font-bold text-foreground">{k.jarak} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/60">Harga</span>
                      <span className="font-semibold text-foreground">
                        {formatRupiah(k.harga)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/60">Fasilitas</span>
                      <span className="font-medium text-foreground">
                        {k.fasilitas}<span className="text-xs text-muted-foreground">/5</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/60">Keamanan</span>
                      <span className="font-medium text-foreground">
                        {k.keamanan}<span className="text-xs text-muted-foreground">/5</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/60">Rating</span>
                      <span className="font-medium text-foreground">
                        {k.rating}<span className="text-xs text-muted-foreground">/5</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-2">Keterangan Peta:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>🎓 Universitas Pamulang Viktor</div>
          <div>🥇 Peringkat 1 — 🥈 2 — 🥉 3</div>
          <div>🏠 Kost lainnya</div>
          <div>Lingkaran = radius 1 & 2 km</div>
        </div>
      </div>
    </div>
  );
}