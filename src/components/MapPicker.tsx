import React, { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search } from "lucide-react";

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
  disabled?: boolean;
}

const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
}) => {
  const defaultCenter: [number, number] = [4.0511, 21.7587]; // RDC centre approx
  const initial: [number, number] = (() => {
    const lat = latitude ? parseFloat(latitude) : NaN;
    const lng = longitude ? parseFloat(longitude) : NaN;
    return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : defaultCenter;
  })();

  const [position, setPosition] = useState<[number, number]>(initial);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [locationName, setLocationName] = useState<string>("");
  const [showPOI, setShowPOI] = useState(false);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const poiMarkersRef = useRef<LeafletMarker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    const map = L.map(mapEl.current, {
      center: position,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
      maxZoom: 19,
      preferCanvas: true,
    });
    mapRef.current = map;

    // Using Carto's high-quality tiles with retina support
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
      detectRetina: true,
    }).addTo(map);

    // Place initial marker
    markerRef.current = L.marker(position).addTo(map);

    // Click to set position
    if (!disabled) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setMarkerAndNotify(newPos);
      });
    }

    // Clean up
    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker if position changes from props
  useEffect(() => {
    const lat = latitude ? parseFloat(latitude) : NaN;
    const lng = longitude ? parseFloat(longitude) : NaN;
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerAndNotify([lat, lng], false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  const setMarkerAndNotify = async (newPos: [number, number], fly = true) => {
    setPosition(newPos);
    
    // Reverse geocoding pour obtenir le nom du lieu
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos[0]}&lon=${newPos[1]}`
      );
      const data = await response.json();
      const name = data.display_name || "Lieu inconnu";
      setLocationName(name);
      
      // Créer ou mettre à jour le marqueur avec popup
      if (markerRef.current) {
        markerRef.current.setLatLng(newPos);
        markerRef.current.bindPopup(`<strong>${name}</strong>`).openPopup();
      } else if (mapRef.current) {
        markerRef.current = L.marker(newPos).addTo(mapRef.current);
        markerRef.current.bindPopup(`<strong>${name}</strong>`).openPopup();
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      if (markerRef.current) {
        markerRef.current.setLatLng(newPos);
      } else if (mapRef.current) {
        markerRef.current = L.marker(newPos).addTo(mapRef.current);
      }
    }
    
    if (mapRef.current && fly) {
      mapRef.current.flyTo(newPos, Math.max(mapRef.current.getZoom(), 13));
    }
    if (!disabled) {
      onLocationChange(newPos[0], newPos[1]);
    }
    
    // Charger les POI si activé
    if (showPOI) {
      loadNearbyPOI(newPos);
    }
  };

  const loadNearbyPOI = async (center: [number, number]) => {
    if (!mapRef.current) return;
    
    // Nettoyer les anciens POI
    poiMarkersRef.current.forEach(m => m.remove());
    poiMarkersRef.current = [];
    
    try {
      // Utiliser Overpass API pour récupérer les POI dans un rayon de ~500m
      const radius = 500;
      const query = `
        [out:json][timeout:5];
        (
          node["amenity"](around:${radius},${center[0]},${center[1]});
          node["shop"](around:${radius},${center[0]},${center[1]});
          node["tourism"](around:${radius},${center[0]},${center[1]});
        );
        out body;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`
      });
      
      const data = await response.json();
      
      // Créer un icône personnalisé pour les POI
      const poiIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [0, -32],
      });
      
      // Limiter à 20 POI pour ne pas surcharger
      const elements = data.elements.slice(0, 20);
      
      elements.forEach((element: any) => {
        if (element.lat && element.lon && mapRef.current) {
          const name = element.tags?.name || element.tags?.amenity || element.tags?.shop || 'POI';
          const marker = L.marker([element.lat, element.lon], { icon: poiIcon })
            .addTo(mapRef.current);
          
          marker.bindPopup(`
            <div style="font-size: 12px;">
              <strong>${name}</strong><br/>
              ${element.tags?.amenity ? `Type: ${element.tags.amenity}` : ''}
              ${element.tags?.shop ? `Boutique: ${element.tags.shop}` : ''}
            </div>
          `);
          
          poiMarkersRef.current.push(marker);
        }
      });
    } catch (error) {
      console.error("Error loading POI:", error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation || disabled) return;
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        const coords: [number, number] = [
          loc.coords.latitude,
          loc.coords.longitude,
        ];
        setMarkerAndNotify(coords);
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim() || disabled) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) for geocoding - free, no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newPos: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
        setMarkerAndNotify(newPos);
      } else {
        alert("Lieu non trouvé. Veuillez essayer une autre recherche.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchLocation();
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {disabled ? "Position géographique" : "Cliquez sur la carte pour sélectionner"}
            </span>
          </div>
          <div className="flex gap-2">
            {!disabled && (
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
            )}
            <Button
              type="button"
              variant={showPOI ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newState = !showPOI;
                setShowPOI(newState);
                if (newState && position) {
                  loadNearbyPOI(position);
                } else {
                  poiMarkersRef.current.forEach(m => m.remove());
                  poiMarkersRef.current = [];
                }
              }}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              POI
            </Button>
          </div>
        </div>
        
        {locationName && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            📍 <strong>Lieu:</strong> {locationName}
          </div>
        )}

        {!disabled && (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Rechercher un lieu (ex: Kinshasa, RDC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              disabled={isSearching}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={searchLocation}
              disabled={isSearching || !searchQuery.trim()}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? "..." : "Chercher"}
            </Button>
          </div>
        )}

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
