import { Home } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StarRating } from "./StarRating";
import type { Kost } from "@/contexts/KostContext";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function KostCard({ kost, rank, highlight }: { kost: Kost; rank?: number; highlight?: boolean }) {
  return (
    <Link
      to="/kost/$kostId"
      params={{ kostId: kost.id }}
      className={`group relative flex flex-col h-full rounded-3xl overflow-hidden card-lift nb-border ${
        highlight ? "bg-primary" : "bg-card"
      }`}
    >
      {/* Image */}
      <div className="relative h-44 shrink-0 overflow-hidden bg-muted border-b-[2.5px] border-border m-2 rounded-2xl">
        {kost.image ? (
          <img
            src={kost.image}
            alt={kost.nama}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Home size={40} className="text-muted-foreground/30" />
          </div>
        )}

        {/* Rank badge */}
        {rank !== undefined && (
          <div className="absolute top-3 left-3 bg-foreground text-primary px-3 py-1 text-xs font-black rounded-full nb-shadow-sm rotate-[-4deg]">
            #{rank + 1}
          </div>
        )}

        {/* Highlight badge */}
        {highlight && (
          <div className="absolute top-3 left-3 bg-foreground text-primary px-3 py-1 text-xs font-black rounded-full rotate-[-4deg]">
            ★ TOP PICK
          </div>
        )}

        {/* Score badge — top right */}
        <div className="absolute top-3 right-3 bg-card px-3 py-1 nb-border-thin rounded-full text-xs font-extrabold rotate-3">
          ★ {kost.rating.toFixed(2)}
        </div>
      </div>

      <div className={`px-4 pb-4 pt-2 space-y-3 flex flex-col flex-1 ${highlight ? "bg-primary" : "bg-card"}`}>
        <div className="min-h-12">
          <h3 className="text-lg font-black text-card-foreground leading-tight line-clamp-1">
            {kost.nama}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground mt-1 font-hand">
              ✦ {kost.jarak} km dari kampus
            </p>
            <StarRating value={kost.rating} size={11} />
          </div>
        </div>

        {/* Price block */}
        <div className="flex items-center justify-between gap-2 bg-primary rounded-full border-2 border-foreground px-3 py-1">
          <span className="font-extrabold text-xs text-foreground">{formatRupiah(kost.harga)}</span>
        </div>

        {/* Tech pills */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          <span className="pill-tech bg-pastel-yellow">Fasilitas {kost.fasilitas}/5</span>
          <span className="pill-tech bg-pastel-pink">Keamanan {kost.keamanan}/5</span>
          <span className="pill-tech bg-pastel-blue">Bersih {kost.kebersihan}/5</span>
          <span className="pill-tech bg-pastel-purple">Akses {kost.akses}/5</span>
        </div>
      </div>
    </Link>
  );
}
