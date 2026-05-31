import { createFileRoute } from "@tanstack/react-router";
import { useKost } from "@/contexts/KostContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { GitCompareArrows } from "lucide-react";

export const Route = createFileRoute("/perbandingan")({
  component: PerbandinganPage,
  head: () => ({
    meta: [
      { title: "Perbandingan — KostSPK" },
      { name: "description", content: "Bandingkan kost secara side-by-side" },
    ],
  }),
});

const COLORS = ["#7dd3c0", "#f4b8c4", "#c9b6f5"];
const CRITERIA = [
  { key: "harga", label: "Harga", max: 1500000, invert: true },
  { key: "jarak", label: "Jarak", max: 3, invert: true },
  { key: "fasilitas", label: "Fasilitas", max: 5, invert: false },
  { key: "keamanan", label: "Keamanan", max: 5, invert: false },
  { key: "kebersihan", label: "Kebersihan", max: 5, invert: false },
  { key: "rating", label: "Rating", max: 5, invert: false },
] as const;

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function PerbandinganPage() {
  const { kostList } = useKost();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selectedKost = selected.map((id) => kostList.find((k) => k.id === id)!).filter(Boolean);

  const radarData = CRITERIA.map((c) => {
    const point: Record<string, string | number> = { criteria: c.label };
    selectedKost.forEach((k) => {
      const raw = k[c.key as keyof typeof k] as number;
      point[k.nama] = c.invert ? ((c.max - raw) / c.max) * 5 : raw;
    });
    return point;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Perbandingan Kost</h1>
        <p className="text-muted-foreground mt-1">Pilih 2–3 kost untuk dibandingkan</p>
      </div>

      {/* Selection */}
      <div className="flex flex-wrap gap-2">
        {kostList.map((k) => {
          const isSelected = selected.includes(k.id);
          return (
            <button
              key={k.id}
              onClick={() => toggleSelect(k.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium border transition-all ${
                isSelected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              {k.nama}
            </button>
          );
        })}
      </div>

      {selectedKost.length >= 2 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Radar Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-card-foreground mb-4">Radar Perbandingan</h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(0.25 0.02 280)" />
                <PolarAngleAxis dataKey="criteria" tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "oklch(0.5 0.02 260)", fontSize: 10 }} />
                {selectedKost.map((k, i) => (
                  <Radar
                    key={k.id}
                    name={k.nama}
                    dataKey={k.nama}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ color: "oklch(0.7 0.02 260)", fontSize: 13 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Side-by-side stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedKost.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-5"
                style={{ borderTopColor: COLORS[i], borderTopWidth: 3 }}
              >
                <h3 className="font-heading text-lg font-bold text-card-foreground mb-4">{k.nama}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Harga</span><span className="text-foreground">{formatRupiah(k.harga)}/bln</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Jarak</span><span className="text-foreground">{k.jarak} km</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fasilitas</span><span className="text-foreground">{k.fasilitas}/5</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Keamanan</span><span className="text-foreground">{k.keamanan}/5</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Kebersihan</span><span className="text-foreground">{k.kebersihan}/5</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="text-foreground font-bold" style={{ color: COLORS[i] }}>{k.rating}/5</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <GitCompareArrows size={48} className="mx-auto mb-4 opacity-30" />
          <p>Pilih minimal 2 kost untuk mulai membandingkan.</p>
        </div>
      )}
    </div>
  );
}
