import { createFileRoute, Link } from "@tanstack/react-router";
import { useKost, type Kost } from "../contexts/KostContext";
import { KostModal } from "../components/KostModal";
import { useState } from "react";
import { calculateWP } from "../contexts/KostContext";
import { Plus, Search, Pencil, Trash2, Database, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/data-kost")({
  component: DataKostPage,
  head: () => ({
    meta: [
      { title: "Data Kost — KostSPK" },
      { name: "description", content: "Kelola data kost untuk analisis SPK" },
    ],
  }),
});

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function Nilai({ v }: { v: number }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold ">
      {v}/5
    </span>
  );
}
function DataKostPage() {
  const { kostList, addKost, updateKost, deleteKost } = useKost();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Kost | null>(null);

  const ranking = calculateWP(kostList);
  const rankedKost = ranking.map((k, i) => ({ ...k, rank: i }));
  const filtered = rankedKost.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (data: Omit<Kost, "id" | "jarak">) => {
    try {
      if (editing) {
        await updateKost(editing.id, data);
        toast.success("Kost berhasil diperbarui!");
      } else {
        await addKost(data);
        toast.success("Kost berhasil ditambahkan!");
      }
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data kost");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteKost(id);
      toast.success("Kost berhasil dihapus!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus data kost");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Data Kost
        </h1>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Tambah Kost
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          placeholder="Cari kost..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-input border border-border pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Database size={48} className="mx-auto mb-4 opacity-30" />
          <p>
            {kostList.length === 0
              ? "Belum ada data kost."
              : "Tidak ditemukan kost yang cocok."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar ">
            <table className="w-full min-w-300 text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-5 py-4 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Rank
                  </th>

                  <th className="px-5 py-4 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Nama Kost
                  </th>

                  <th className="px-5 py-4 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Harga
                  </th>

                  <th className="px-5 py-4 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Jarak
                  </th>

                  <th className="px-5 py-4 text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Fasilitas
                  </th>

                  <th className="px-5 py-4 text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Keamanan
                  </th>

                  <th className="px-5 py-4 text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Kebersihan
                  </th>

                  <th className="px-5 py-4 text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Akses
                  </th>

                  <th className="px-5 py-4 text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((k) => (
                  <tr
                    key={k.id}
                    // initial={{ opacity: 0, y: 5 }}
                    // animate={{ opacity: 1, y: 0 }}
                    // transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-primary/5 transition-all duration-200"
                  >
                    {/* Rank */}
                    <td className="px-5 py-4">
                      {k.rank === 0 ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-600">
                          #1
                        </span>
                      ) : k.rank === 1 ? (
                        <span className="inline-flex items-center rounded-full bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-600">
                          #2
                        </span>
                      ) : k.rank === 2 ? (
                        <span className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600">
                          #3
                        </span>
                      ) : (
                        <span className="font-semibold text-muted-foreground px-3 py-1 text-xs">
                          #{k.rank + 1}
                        </span>
                      )}
                    </td>

                    {/* Nama */}
                    <td className="px-5 py-4">
                      <Link
                        to="/kost/$kostId"
                        params={{ kostId: k.id }}
                        className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                      >
                        {k.nama}
                      </Link>
                    </td>

                    {/* Harga */}
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-foreground">
                      {formatRupiah(k.harga)}
                    </td>

                    {/* Jarak */}
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                      {k.jarak} km
                    </td>

                    {/* Kriteria */}
                    <td className="px-5 py-4 text-center">
                      <Nilai v={k.fasilitas} />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <Nilai v={k.keamanan} />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <Nilai v={k.kebersihan} />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <Nilai v={k.akses} />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <Nilai v={k.rating} />
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/kost/$kostId"
                          params={{ kostId: k.id }}
                          title="Lihat Detail"
                          className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-primary/10 hover:text-cyan-700 transition-colors"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          onClick={() => {
                            setEditing(k);
                            setModalOpen(true);
                          }}
                          title="Edit"
                          className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-primary/10 hover:text-blue-700 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(k.id)}
                          title="Hapus"
                          className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <KostModal
        key={modalOpen ? (editing?.id ?? "new") : "closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
