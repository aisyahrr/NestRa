import { Link } from "@tanstack/react-router";
import type { Kost } from "@/contexts/KostContext";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function BestKostCard({ kost }: { kost: Kost }) {
    return (
        <Link
        to="/kost/$kostId"
        params={{ kostId: kost.id }}
        className="block group"
        >
        <div className="grid grid-cols-1 lg:grid-cols-12 nb-border nb-shadow-lg bg-card overflow-hidden rounded-4xl transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_0_var(--color-border)]">
            {/* Image side */}
            <div className="lg:col-span-7 relative bg-muted border-b-[2.5px] lg:border-b-0 lg:border-r-[2.5px] border-border overflow-hidden">
                <img
                    src={kost.image}
                    alt={kost.nama}
                    className="w-full h-full max-h-105 object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-foreground text-primary px-4 py-1.5 text-xs font-black rounded-full -rotate-3 border-2 border-foreground">
                    ★ EDITOR'S CHOICE
                </div>
                <div className="absolute bottom-4 left-4 bg-primary text-foreground px-3 py-1 text-xs font-extrabold rounded-full nb-border-thin">
                    ✦ {kost.jarak} km dari kampus
                </div>
            </div>

            {/* Data side */}
            <div className="lg:col-span-5 p-8 flex flex-col justify-center gap-6">
                <div>
                    <div className="inline-block bg-secondary text-foreground tech-label px-3 py-1 mb-3 rounded-full border-2 border-foreground">
                        ✿ RANK 01 — HIGHEST SCORE
                    </div>
                    <h3 className="font-heading text-3xl font-black leading-[0.95] tracking-tight line-clamp-2">
                    {kost.nama}
                    </h3>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b-2 border-dashed border-border/50 pb-1">
                        <span className="opacity-70">Fasilitas</span>
                        <span className="font-bold">{kost.fasilitas.toFixed(2)} / 5.00</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-dashed border-border/50 pb-1">
                        <span className="opacity-70">Keamanan</span>
                        <span className="font-bold">{kost.keamanan.toFixed(2)} / 5.00</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-dashed border-border/50 pb-1">
                        <span className="opacity-70">Kebersihan</span>
                        <span className="font-bold">{kost.kebersihan.toFixed(2)} / 5.00</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-dashed border-border/50 pb-1">
                        <span className="opacity-70">Rating</span>
                        <span className="font-bold">{kost.rating.toFixed(2)} ★</span>
                    </div>
                </div>

                <div className="flex items-end justify-between border-t-[2.5px] border-dashed border-border pt-4">
                    <div>
                        <p className="font-hand text-base opacity-70">harga / bulan</p>
                        <p className="text-xl font-extrabold">{formatRupiah(kost.harga)}</p>
                    </div>
                    <div className="bg-primary text-foreground px-5 py-3 font-black text-xs rounded-full border-2 border-foreground shadow-[3px_3px_0_0_var(--color-border)]">
                        Lihat Detail →
                    </div>
                </div>
            </div>
        </div>
        </Link>
    );
}