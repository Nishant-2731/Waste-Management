import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { haversineDistance } from '../utils/haversine.js';

const RECYCLING_CENTERS = [
  { name: 'Samsung Service - Lucknow', address: 'Hazratganj, Lucknow, UP', lat: 26.8467, lng: 80.9462 },
  { name: 'Samsung Service - Delhi', address: 'Connaught Place, New Delhi', lat: 28.633, lng: 77.2199 },
  { name: 'Samsung Service - Mumbai', address: 'Andheri West, Mumbai, MH', lat: 19.1197, lng: 72.8464 },
  { name: 'Samsung Service - Bengaluru', address: 'Koramangala, Bengaluru, KA', lat: 12.9352, lng: 77.6245 },
  { name: 'Samsung Service - Chennai', address: 'T. Nagar, Chennai, TN', lat: 13.04, lng: 80.2376 },
];

export default function MapSection() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [nearestCenter, setNearestCenter] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Fix default icon paths for Leaflet when bundling
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    RECYCLING_CENTERS.forEach(center => {
      L.marker([center.lat, center.lng]).addTo(map).bindPopup(`<b>${center.name}</b><br>${center.address}`);
    });

    // Blue marker for user location
    const blueIcon = new L.Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 10);
          L.marker([latitude, longitude], { icon: blueIcon }).addTo(map).bindPopup('Your Location').openPopup();

          // Find nearest center
          let nearest = null;
          let minDistance = Infinity;
          RECYCLING_CENTERS.forEach(center => {
            const distance = haversineDistance(latitude, longitude, center.lat, center.lng);
            if (distance < minDistance) {
              minDistance = distance;
              nearest = center;
            }
          });
          if (nearest) {
            setNearestCenter({ ...nearest, distance: minDistance.toFixed(2) });
          }
        },
        () => {
          console.warn('Geolocation permission denied.');
        }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Authorized Recycling Centers</h2>
      <div ref={mapContainerRef} className="h-96 rounded-lg shadow-md"></div>
      {nearestCenter && (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-800">
            <i className="fa-solid fa-location-dot mr-2"></i>
            Nearest Center to You
          </h3>
          <p className="text-gray-700 mt-1">
            {`${nearestCenter.name} - ${nearestCenter.address} (${nearestCenter.distance} km away)`}
          </p>
        </div>
      )}
    </section>
  );
}