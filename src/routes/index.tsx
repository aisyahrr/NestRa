import { createFileRoute } from "@tanstack/react-router";
import { useKost } from "@/contexts/KostContext";
import { KostCard } from "@/components/KostCard";
import { BestKostCard } from "@/components/BestKostCard";
import { Building2, Trophy, DollarSign, Star } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    title: "Analisis SPK — KostSPK",
    meta: [
      {
        name: "description",
        content: "Analisis ranking kost dengan metode Weighted Product",
      },
    ],
  }),
});

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function Dashboard() {
  const { kostList } = useKost();

  const totalKost = kostList.length;
  const avgHarga = kostList.length ? kostList.reduce((s, k) => s + k.harga, 0) / kostList.length : 0;
  const avgRating = kostList.length ? kostList.reduce((s, k) => s + k.rating, 0) / kostList.length : 0;
  const best = kostList.length ? [...kostList].sort((a, b) => b.rating - a.rating)[0] : null;

  const cards = [
    { label: "Total Kost", value: totalKost.toString(), icon: Building2, bg: "bg-card", fg: "text-foreground" },
    { label: "Top Pilihan", value: best?.nama || "-", icon: Trophy, bg: "bg-primary", fg: "text-foreground" },
    { label: "Rata-rata Harga", value: formatRupiah(Math.round(avgHarga)), icon: DollarSign, bg: "bg-pastel-pink", fg: "text-foreground" },
    { label: "Rata-rata Rating", value: avgRating.toFixed(1), icon: Star, bg: "bg-pastel-blue", fg: "text-foreground" },
  ] as const;

  return (
    <div className="space-y-10">
      {/* Hero — Editorial header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-4 border-b-[2.5px] border-dashed border-border pb-6 relative"
      >
        <div className="max-w-2xl">
          <div className="inline-block tech-label bg-foreground text-primary px-3 py-1 mb-3 rounded-full">
            ✿ Dashboard
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none">
            Cari kost <span className="italic">terbaik</span><br />
            dekat <span className="bg-primary border-2 border-foreground px-3 rounded-2xl inline-block -rotate-1">kampus</span>
          </h1>
          <p className="text-foreground/70 mt-4 font-hand text-base">
            sistem pendukung keputusan — metode Weighted Product ✦
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="font-hand text-xl text-foreground/60">metode</span>
          <div className="bg-foreground text-primary px-5 py-2 font-bold text-xl rounded-full border-2 border-foreground">Weighted Product</div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-3xl nb-border ${c.bg} ${c.fg} p-5 card-lift relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm">{c.label}</span>
              <div className="bg-card border-2 border-foreground rounded-full p-2">
                <c.icon size={14} />
              </div>
            </div>
            <p className="text-base md:text-xl font-extrabold tracking-tight truncate">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Best recommendation */}
      {best && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-4 mb-6">
            <span className="h-0.5 w-12 bg-foreground rounded-full" />
            <h2 className="font-heading text-2xl font-black">★ Rekomendasi Terbaik</h2>
            <span className="h-0.5 flex-1 bg-foreground rounded-full" />
          </div>
          <BestKostCard kost={best} />
        </motion.div>
      )}

      {/* All kost */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <span className="h-0.5 w-12 bg-foreground rounded-full" />
          <h2 className="font-heading text-2xl font-black">✦ Semua Pilihan Kost</h2>
          <span className="h-0.5 flex-1 bg-foreground rounded-full" />
        </div>
        {kostList.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 size={48} className="mx-auto mb-4 opacity-30" />
            <p>Belum ada data kost. Tambahkan di halaman Data Kost.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kostList.map((k, i) => (
              <motion.div key={k.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }} className="h-full">
                <KostCard kost={k} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
