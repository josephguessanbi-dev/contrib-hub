import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude?: string;
  longitude?: string;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition }: { 
  position: [number, number]; 
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return <Marker position={position} />;
}

const MapPicker = ({ latitude, longitude, onLocationChange }: MapPickerProps) => {
  const defaultCenter: [number, number] = [4.0511, 21.7587]; // Centre de la RDC
  const [position, setPosition] = useState<[number, number]>(() => {
    const lat = latitude ? parseFloat(latitude) : null;
    const lng = longitude ? parseFloat(longitude) : null;
    return (lat && lng && !isNaN(lat) && !isNaN(lng)) 
      ? [lat, lng] 
      : defaultCenter;
  });

  useEffect(() => {
    if (position) {
      onLocationChange(position[0], position[1]);
    }
  }, [position, onLocationChange]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPos: [number, number] = [
            location.coords.latitude,
            location.coords.longitude
          ];
          setPosition(newPos);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        }
      );
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Cliquez sur la carte pour sélectionner la position</span>
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
      <div className="h-[400px] w-full">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          key={`${position[0]}-${position[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    </Card>
  );
};

export default MapPicker;
