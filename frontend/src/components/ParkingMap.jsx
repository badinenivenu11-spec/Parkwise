import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Star, ExternalLink, Zap } from 'lucide-react';

// Fix Leaflet's default icon paths in bundled environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom parking pin icon
const createParkingIcon = (color = '#10B981') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        border: 2px solid #ffffff;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 800;
          font-size: 14px;
          font-family: sans-serif;
        ">P</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function ParkingMap({ facilities = [], selectedId, onSelectFacility }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [userLoc, setUserLoc] = useState(null);
  const [locating, setLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center to Bengaluru (where most seed facilities are)
    const initialLat = 12.9716;
    const initialLng = 77.5946;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      scrollWheelZoom: true,
    });

    // Dark/Neutral styled OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | ParkEase',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const validFacilities = facilities.filter(
      (f) => f.coordinates && f.coordinates.latitude && f.coordinates.longitude
    );

    if (validFacilities.length === 0) return;

    const bounds = L.latLngBounds();

    validFacilities.forEach((fac) => {
      const lat = fac.coordinates.latitude;
      const lng = fac.coordinates.longitude;
      const isSelected = selectedId === fac._id;
      const isFull = fac.availableSlots === 0;

      const markerColor = isSelected ? '#3B82F6' : isFull ? '#EF4444' : '#10B981';
      const icon = createParkingIcon(markerColor);

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Popup Content
      const carRate = fac.pricingRules?.find((p) => p.vehicleType === 'car') || fac.pricingRules?.[0];
      const popupHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 2px;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A; margin-bottom: 2px;">
            ${fac.name}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            ${fac.address?.street ? fac.address.street + ', ' : ''}${fac.address?.city}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 11px;">
            <span style="font-weight: 700; color: ${fac.availableSlots > 0 ? '#059669' : '#DC2626'};">
              ${fac.availableSlots} / ${fac.totalSlots} Slots Free
            </span>
            <span style="font-weight: 800; color: #0F172A;">
              ₹${carRate ? carRate.baseRate : 50}/hr
            </span>
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="/facilities/${fac._id}" style="
              flex: 1;
              background-color: #10B981;
              color: white;
              padding: 5px 8px;
              border-radius: 6px;
              text-align: center;
              font-size: 11px;
              font-weight: 600;
              text-decoration: none;
              display: inline-block;
            ">View & Book</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="
              background-color: #F1F5F9;
              color: #334155;
              padding: 5px 8px;
              border-radius: 6px;
              text-align: center;
              font-size: 11px;
              font-weight: 600;
              text-decoration: none;
              display: inline-block;
            ">Directions</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectFacility) onSelectFacility(fac);
      });

      markersRef.current[fac._id] = marker;
      bounds.extend([lat, lng]);
    });

    if (validFacilities.length > 0 && !selectedId) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [facilities, selectedId, onSelectFacility]);

  // Center on selected facility
  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return;
    const fac = facilities.find((f) => f._id === selectedId);
    if (fac?.coordinates?.latitude && fac?.coordinates?.longitude) {
      mapInstanceRef.current.flyTo(
        [fac.coordinates.latitude, fac.coordinates.longitude],
        15,
        { duration: 1.2 }
      );
      markersRef.current[selectedId]?.openPopup();
    }
  }, [selectedId, facilities]);

  // Geolocation handling
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc([latitude, longitude]);
        setLocating(false);

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latitude, longitude], 14);

          // Add user pulse circle marker
          L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#3B82F6',
            color: '#FFFFFF',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
          })
            .addTo(map)
            .bindPopup('<b>Your Current Location</b>')
            .openPopup();
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err.message);
        setLocating(false);
        alert('Could not retrieve your location. Location permission may be denied.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-navy-800 shadow-xl bg-navy-950">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Locate Me Floating Button */}
      <button
        onClick={handleLocateMe}
        disabled={locating}
        className="absolute top-4 right-4 z-20 px-3 py-2 rounded-xl bg-navy-900/90 hover:bg-navy-800 text-white border border-navy-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 transition"
        title="Find your location on map"
      >
        <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${locating ? 'animate-spin' : ''}`} />
        <span>{locating ? 'Locating...' : 'My Location'}</span>
      </button>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 px-3 py-2 rounded-xl bg-navy-900/90 border border-navy-700/80 shadow-2xl backdrop-blur-md text-[11px] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-300 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-300 font-medium">Full</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-slate-300 font-medium">Selected</span>
        </div>
      </div>
    </div>
  );
}
