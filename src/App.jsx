// src/App.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as satellite from 'satellite.js';

import SatelliteInfoPanel from './SatelliteInfoPanel';
import { satelliteInfo } from './satelliteData';
import SearchBar from './SearchBar';

// --- Icons setup ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const issIcon = L.icon({
  iconUrl: '/Icons/Iss-icon.png',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25],
});
const hubbleIcon = L.icon({
  iconUrl: '/Icons/hubble-icon.png',
  iconSize: [50, 50],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});
const defaultSatelliteIcon = L.icon({
  iconUrl: '/Icons/Satellite-icon.png',
  iconSize: [35, 35],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});
const highlightIcon = L.divIcon({
  className: 'satellite-highlight',
  html: `<div style="width:50px;height:50px;border:2px solid red;border-radius:8px;"></div>`,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const maxBounds = [
  [-85, -Infinity],
  [85, Infinity],
];
const SAT_API_KEY = '5G3VVN-7MGCD7-YDMY6A-5J9N';

const FEATURED_SATELLITES = [
  { name: 'International Space Station', noradId: 25544, type: 'iss' },
  { name: 'Hubble Space Telescope', noradId: 20580, type: 'hubble' },
  { name: 'Tiangong Space Station', noradId: 48274 },
  { name: 'GPS BIIF-12 (USA 265)', noradId: 41334 },
];

const getIcon = (sat) => {
  if (sat.type === 'iss') return issIcon;
  if (sat.type === 'hubble') return hubbleIcon;
  return defaultSatelliteIcon;
};

// 🔹 Pans/zooms when a satellite is searched
function SearchHighlighter({ searchedSat }) {
  const map = useMap();

  useEffect(() => {
    if (searchedSat) {
      map.flyTo([searchedSat.lat, searchedSat.lon], 4, { duration: 1.5 });
    }
  }, [searchedSat, map]);

  if (!searchedSat) return null;

  return (
    <Marker
      key={`highlight-${searchedSat.noradId}`}
      position={[searchedSat.lat, searchedSat.lon]}
      icon={highlightIcon}
      interactive={false}
      zIndexOffset={1000}
    />
  );
}

export default function App() {
  const [satellitePositions, setSatellitePositions] = useState([]);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState(null);
  const [searchedId, setSearchedId] = useState(null);

  // --- Fetch TLEs + update positions ---
  useEffect(() => {
    let positionInterval;
    async function initializeTracker() {
      const featuredPromises = FEATURED_SATELLITES.map(async (sat) => {
        try {
          const res = await fetch(
            `/api/rest/v1/satellite/tle/${sat.noradId}?apiKey=${SAT_API_KEY}`
          );
          if (!res.ok) throw new Error(`N2YO API Error ${res.status}`);
          const data = await res.json();
          const satrec = satellite.twoline2satrec(
            data.tle.split('\n')[0].trim(),
            data.tle.split('\n')[1].trim()
          );

          const localInfo = satelliteInfo[sat.noradId] || {
            name: sat.name,
            imageUrl: '/Icons/Satellite-icon.png',
            description: 'No additional info available.',
            type: sat.type,
          };

          return { ...sat, satrec, ...localInfo };
        } catch (e) {
          console.error(`Failed to fetch TLE for ${sat.name}`, e);
          return null;
        }
      });

      const bulkSatsPromise = async () => {
        try {
          const res = await fetch(
            '/celestrak/NORAD/elements/gp.php?GROUP=active&FORMAT=tle'
          );
          const text = await res.text();
          const sats = [];
          const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
          for (let i = 0; i + 2 < lines.length; i += 3) {
            if (sats.length >= 200) break;
            const name = lines[i];
            const l1 = lines[i + 1];
            const l2 = lines[i + 2];
            try {
              const noradId = parseInt(l2.substring(2, 7), 10);
              if (isNaN(noradId)) continue;

              const satrec = satellite.twoline2satrec(l1, l2);
              const localInfo = satelliteInfo[noradId] || {
                name,
                imageUrl: '/Icons/Satellite-icon.png',
                description: 'Get info',
                type: undefined,
              };

              sats.push({ noradId, satrec, ...localInfo });
            } catch {}
          }
          return sats;
        } catch {
          return [];
        }
      };

      const [featuredResults, bulkResult] = await Promise.allSettled([
        Promise.all(featuredPromises),
        bulkSatsPromise(),
      ]);
      const featured = featuredResults.status === 'fulfilled'
        ? featuredResults.value.filter(Boolean)
        : [];
      const bulk = bulkResult.status === 'fulfilled' ? bulkResult.value : [];

      const featuredIds = new Set(featured.map((s) => s.noradId));
      const allSatellites = [...featured, ...bulk.filter((s) => !featuredIds.has(s.noradId))];

      const computePositions = () => {
        const now = new Date();
        const gmst = satellite.gstime(now);
        const positions = allSatellites
          .map((sat) => {
            try {
              const pv = satellite.propagate(sat.satrec, now);
              if (!pv?.position || !pv?.velocity) return null;
              const gd = satellite.eciToGeodetic(pv.position, gmst);
              const velocity = pv.velocity;
              const speed = Math.sqrt(
                velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
              );
              const lat = satellite.degreesLat(gd.latitude);
              const lon = satellite.degreesLong(gd.longitude);
              if (isNaN(lat) || isNaN(lon)) return null;
              return { ...sat, lat, lon, speed };
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        setSatellitePositions(positions);
      };

      computePositions();
      positionInterval = setInterval(computePositions, 2000);
    }

    initializeTracker();
    return () => positionInterval && clearInterval(positionInterval);
  }, []);

  // --- Handlers ---
  const handleSearch = (id) => {
    const exists = satellitePositions.some((s) => s.noradId === id);
    if (exists) {
      setSearchedId(id);
      setSelectedSatelliteId(id);
      return true;
    }
    return false;
  };

  const handleClear = () => {
    setSearchedId(null);
    setSelectedSatelliteId(null);
  };

  const handleMarkerClick = (satellite) => {
    setSelectedSatelliteId(satellite.noradId);
  };
  const handleClosePanel = () => {
    setSelectedSatelliteId(null);
  };

  const selectedSatellite = selectedSatelliteId
    ? satellitePositions.find((s) => s.noradId === selectedSatelliteId)
    : null;
  const searchedSatellite = searchedId
    ? satellitePositions.find((s) => s.noradId === searchedId)
    : null;

  return (
    <div className="h-screen w-screen">
      <SearchBar
        onSearch={handleSearch}
        onClear={handleClear}
        highlightedId={searchedId}
      />

      <MapContainer
        center={[0, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom
        worldCopyJump
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        className="h-full w-screen z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          attribution='© <a href="https://carto.com/">CARTO</a> | OpenStreetMap contributors'
        />

        {satellitePositions.map((s) => (
          <Marker
            key={s.noradId}
            position={[s.lat, s.lon]}
            icon={getIcon(s)}
            eventHandlers={{ click: () => handleMarkerClick(s) }}
          />
        ))}

        <SearchHighlighter searchedSat={searchedSatellite} />
      </MapContainer>

      {selectedSatellite && (
        <SatelliteInfoPanel
          satellite={selectedSatellite}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}