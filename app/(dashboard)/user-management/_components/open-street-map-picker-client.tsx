"use client";

import { useEffect, useMemo, useState } from "react";
import L, { type DragEndEvent } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LocateFixed, Search } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_ZOOM = 15;

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapCenterSync({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true });
  }, [latitude, longitude, map]);

  return null;
}

function LocationPicker({
  onChange,
}: {
  onChange: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function OpenStreetMapPickerClient({
  latitude,
  longitude,
  onChange,
  heightClassName = "h-[360px]",
}: {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
  heightClassName?: string;
}) {
  const mapCenter = useMemo<[number, number]>(() => [latitude, longitude], [latitude, longitude]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const results = (await response.json()) as Array<{ lat: string; lon: string }>;

      if (results.length === 0) {
        toast.error("No location found");
        return;
      }

      const nextLat = Number(results[0].lat);
      const nextLon = Number(results[0].lon);

      if (Number.isNaN(nextLat) || Number.isNaN(nextLon)) {
        toast.error("Invalid location result");
        return;
      }

      onChange(nextLat, nextLon);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to search location");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(position.coords.latitude, position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        toast.error(error.message || "Unable to get your location");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9a9a9a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Search for an address, city, or place..."
            className="h-11 w-full rounded-xl border border-[#dbdbdb] bg-white pr-20 pl-9 text-sm outline-none focus:border-[#a79663]"
          />
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg bg-[#a79663] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Use my current location"
          className="flex h-11 items-center gap-1.5 rounded-xl border border-[#dbdbdb] bg-white px-3 text-xs font-medium text-[#1f1f1f] hover:bg-[#f4f4f4] disabled:opacity-50"
        >
          <LocateFixed className={`size-4 ${isLocating ? "animate-pulse" : ""}`} />
          {isLocating ? "Locating..." : "Locate me"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#dbdbdb]">
        <MapContainer
          center={mapCenter}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className={`${heightClassName} w-full`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapCenterSync latitude={latitude} longitude={longitude} />
          <LocationPicker onChange={onChange} />

          <Marker
            position={mapCenter}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend(event: DragEndEvent) {
                const marker = event.target as L.Marker;
                const position = marker.getLatLng();
                onChange(position.lat, position.lng);
              },
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
