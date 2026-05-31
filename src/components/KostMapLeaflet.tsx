import { useEffect, useState } from "react";
import { UNPAM_VIKTOR, type Kost } from "@/contexts/KostContext";

interface Props {
  kostList: (Kost & { rank?: number })[];
  height?: string;
}

type LeafletComponents = {
  L: typeof import("leaflet");
  MapContainer: typeof import("react-leaflet").MapContainer;
  TileLayer: typeof import("react-leaflet").TileLayer;
  Marker: typeof import("react-leaflet").Marker;
  Popup: typeof import("react-leaflet").Popup;
  Circle: typeof import("react-leaflet").Circle;
};

export function KostMap({
  kostList,
  height = "500px",
}: Props) {
  const [Map, setMap] = useState<LeafletComponents | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const reactLeaflet = await import("react-leaflet");

      setMap({
        L: leaflet,
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        Circle: reactLeaflet.Circle,
      });
    };

    loadMap();
  }, []);

  if (!Map) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border border-border"
      >
        Memuat peta...
      </div>
    );
  }

  const {
    L,
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
  } = Map;

  const kampusIcon = L.divIcon({
    className: "",
    html: `
      <div style="
        background:#2563eb;
        width:40px;
        height:40px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:20px;
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,.25);
      ">
        🎓
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const getKostIcon = (rank?: number) => {
    const bg =
      rank === 0
        ? "#eab308"
        : rank === 1
        ? "#94a3b8"
        : rank === 2
        ? "#f97316"
        : "#22c55e";

    const label =
      rank === 0
        ? "🥇"
        : rank === 1
        ? "🥈"
        : rank === 2
        ? "🥉"
        : "🏠";

    return L.divIcon({
      className: "",
      html: `
        <div style="
          background:${bg};
          width:34px;
          height:34px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          border:2px solid white;
          box-shadow:0 3px 8px rgba(0,0,0,.2);
        ">
          ${label}
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  };

  return (
    <div
      style={{ height }}
      className="overflow-hidden rounded-2xl border border-border"
    >
      <MapContainer
        center={[UNPAM_VIKTOR.lat, UNPAM_VIKTOR.lng]}
        zoom={15}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Radius Kampus */}
        <Circle
          center={[UNPAM_VIKTOR.lat, UNPAM_VIKTOR.lng]}
          radius={1000}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#2563eb",
            fillOpacity: 0.05,
          }}
        />

        <Circle
          center={[UNPAM_VIKTOR.lat, UNPAM_VIKTOR.lng]}
          radius={2000}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#2563eb",
            fillOpacity: 0.03,
            dashArray: "5,5",
          }}
        />

        {/* Marker Kampus */}
        <Marker
          position={[UNPAM_VIKTOR.lat, UNPAM_VIKTOR.lng]}
          icon={kampusIcon}
        >
          <Popup>
            <div>
              <strong>{UNPAM_VIKTOR.name}</strong>
              <br />
              Titik Referensi Kampus
            </div>
          </Popup>
        </Marker>

        {/* Marker Kost */}
        {kostList.map((k) =>
          k.lat != null && k.lng != null ? (
            <Marker
              key={k.id}
              position={[k.lat, k.lng]}
              icon={getKostIcon(k.rank)}
            >
              <Popup>
                <div className="space-y-1 min-w-45">
                  <div className="font-bold">{k.nama}</div>

                  {k.alamat && (
                    <div className="text-xs text-gray-600">
                      {k.alamat}
                    </div>
                  )}

                  <div className="text-xs">
                    Jarak: {k.jarak} km
                  </div>

                  <div className="text-xs">
                    Harga: Rp {k.harga.toLocaleString("id-ID")}
                  </div>

                  <div className="text-xs">
                    Rating: ⭐ {k.rating}/5
                  </div>

                  {typeof k.rank === "number" && (
                    <div className="text-xs font-semibold">
                      Ranking #{k.rank + 1}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}