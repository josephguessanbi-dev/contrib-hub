import React, { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

// Fix default marker icons in Leaflet when bundling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapPickerProps {
  latitude?: string;
  longitude?: string;
  onLocationChange: (lat: number, lng: number) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
}) => {
  const defaultCenter: [number, number] = [4.0511, 21.7587]; // RDC centre approx
  const initial: [number, number] = (() => {
    const lat = latitude ? parseFloat(latitude) : NaN;
    const lng = longitude ? parseFloat(longitude) : NaN;
    return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : defaultCenter;
  })();

  const [position, setPosition] = useState<[number, number]>(initial);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    const map = L.map(mapEl.current, {
      center: position,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      crossOrigin: true,
    }).addTo(map);

    // Place initial marker
    markerRef.current = L.marker(position).addTo(map);

    // Click to set position
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setMarkerAndNotify(newPos);
    });

    // Clean up
    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker if position changes from props (rare)
  useEffect(() => {
    const lat = latitude ? parseFloat(latitude) : NaN;
    const lng = longitude ? parseFloat(longitude) : NaN;
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerAndNotify([lat, lng], false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  const setMarkerAndNotify = (
    newPos: [number, number],
    fly = true
  ) => {
    setPosition(newPos);
    if (markerRef.current) {
      markerRef.current.setLatLng(newPos);
    } else if (mapRef.current) {
      markerRef.current = L.marker(newPos).addTo(mapRef.current);
    }
    if (mapRef.current && fly) {
      mapRef.current.flyTo(newPos, Math.max(mapRef.current.getZoom(), 13));
    }
    onLocationChange(newPos[0], newPos[1]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        const coords: [number, number] = [
          loc.coords.latitude,
          loc.coords.longitude,
        ];
        setMarkerAndNotify(coords);
      },
      (err) => {
        // Fail silently to console; UI already explains usage
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Cliquez sur la carte pour sélectionner la position
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            Ma position
          </Button>
        </div>
        {position && (
          <div className="text-xs text-muted-foreground">
            Position: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        )}
      </div>
      <div ref={mapEl} className="h-[400px] w-full" />
    </Card>
  );
};

export default MapPicker;
