import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { useKost } from "../contexts/KostContext";
import {
  calculateWP,
  type WPWeights,
} from "../contexts/KostContext";
import type { Kost } from "../contexts/KostContext";

export const Route = createFileRoute("/analisis")({
  component: AnalisisPage,
  head: () => ({
    meta: [
      { title: "Analisis SPK — KostSPK" },
      { name: "description", content: "Analisis ranking kost dengan metode Weighted Product" },
    ],
  }),
});

// 🔥 TYPE FIX
type RankedKost = Kost & {
  S: number;
  V: number;
};

// 🔥 TYPE KEY (biar TS aman)
type WeightKey = keyof typeof defaultWeights;

const defaultWeights = {
  harga: 25,
  jarak: 20,
  fasilitas: 20,
  keamanan: 15,
  kebersihan: 10,
  rating: 5,
  akses: 5,
};

export default function AnalisisPage() {
  const { kostList } = useKost();
  const [weights, setWeights] = useState<WPWeights>(defaultWeights);
  const [result, setResult] = useState<RankedKost[]>([]);

  const handleCalculate = () => {
    const ranked = calculateWP(kostList, weights) as RankedKost[];
    setResult(ranked);
  };

  // 🔥 FIX TYPE (no string bebas)
  const handleChange = (key: WeightKey, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const maxV =
  result.length > 0
    ? Math.max(...result.map((r) => r.V))
    : 1;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-gray-800 mb-1">
        Analisis SPK
      </h1>
      <p className="text-gray-500 mb-6">
        Metode: Weighted Product (WP)
      </p>

      {/* CARD BOBOT */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">Bobot Kriteria</h2>
          <span className="text-sm text-gray-500">
            Total: {Object.values(weights).reduce((a, b) => a + b, 0)}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {(Object.entries(weights) as [WeightKey, number][]).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize text-gray-600">
                  {key}
                </span>
                <span className="font-medium text-primary">
                  {value}%
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) =>
                  handleChange(key, Number(e.target.value))
                }
                className="w-full accent-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleCalculate}
        className="bg-primary hover:bg-primary/85 text-white px-6 py-2 rounded-sm shadow mb-6 transition"
      >
        Hitung Ranking
      </button>

      {/* HASIL */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Hasil Ranking
        </h2>

        {result.length === 0 && (
          <p className="text-gray-400">
            Belum ada hasil perhitungan
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {result.map((k, i) => (
            <div
              key={k.id}
              className={`p-5 rounded-2xl border shadow-sm bg-white transition hover:shadow-md ${
                i === 0 ? "border-primary bg-blue-50" : ""
              }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {i === 0 && "🥇 "}
                    {i === 1 && "🥈 "}
                    {i === 2 && "🥉 "}
                    {k.nama}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    📍 {k.jarak} km • 💰 Rp {k.harga}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">Score</p>
                  <p className="text-xl font-bold text-blue-600">
                    {k.V.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                        width: `${(k.V / maxV) * 100}%`,
                      }}
                  />
                </div>
              </div>

              {/* DETAIL */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-xs text-gray-600">
                <div>Fasilitas: {k.fasilitas}</div>
                <div>Keamanan: {k.keamanan}</div>
                <div>Kebersihan: {k.kebersihan}</div>
                <div>Akses: {k.akses}</div>
                <div>Rating: {k.rating}</div>
                <div>Harga: {k.harga}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}