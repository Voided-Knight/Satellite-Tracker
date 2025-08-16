import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as satellite from 'satellite.js';

// Import your custom components and data
import SatelliteInfoPanel from './SatelliteInfoPanel';
import { satelliteInfo } from './satelliteData';

// --- All setup, constants, and icons are unchanged ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
const maxBounds = [[-85, -Infinity], [85, Infinity]];
const SAT_API_KEY = '5G3VVN-7MGCD7-YDMY6A-5J9N';

const FEATURED_SATELLITES = [
  { name: 'International Space Station', noradId: 25544, type: 'iss' },
  { name: 'Hubble Space Telescope', noradId: 20580, type: 'hubble' },
  { name: 'Tiangong Space Station', noradId: 48274 },
];

const getIcon = (sat) => {
  if (sat.type === 'iss') return issIcon;
  if (sat.type === 'hubble') return hubbleIcon;
  return defaultSatelliteIcon;
};

export default function App() {
  const [satellitePositions, setSatellitePositions] = useState([]);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState(null);

  // The single, robust useEffect that handles all initialization
  useEffect(() => {
    let positionInterval;
    async function initializeTracker() {
      // --- Fetch TLEs for your FEATURED list from N2YO ---
      const featuredPromises = FEATURED_SATELLITES.map(async (sat) => {
        try {
          const res = await fetch(`/api/rest/v1/satellite/tle/${sat.noradId}?apiKey=${SAT_API_KEY}`);
          if (!res.ok) throw new Error(`N2YO API Error ${res.status}`);
          const data = await res.json();
          const satrec = satellite.twoline2satrec(data.tle.split('\n')[0].trim(), data.tle.split('\n')[1].trim());
          
          // --- THIS IS THE FIX for FEATURED SATELLITES ---
          // Look up the detailed info from your local database
          const localInfo = satelliteInfo[sat.noradId] || {};
          return { 
            name: sat.name, // Use the name from the featured list
            noradId: sat.noradId,
            type: sat.type,
            satrec: satrec,
            description: localInfo.description, // Get description from database
            imageUrl: localInfo.imageUrl,       // Get image from database
          };
        } catch (e) {
          console.error(`Failed to fetch TLE for ${sat.name}`, e);
          return null;
        }
      });

      // --- Fetch TLEs for the BULK list from Celestrak (Unchanged) ---
      const bulkSatsPromise = async () => {
        try {
          const res = await fetch('/celestrak/NORAD/elements/gp.php?GROUP=active&FORMAT=tle');
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
              
              // --- THIS IS THE FIX for BULK SATELLITES ---
              // Also look up details for bulk satellites in the database
              const localInfo = satelliteInfo[noradId] || {};
              const satrec = satellite.twoline2satrec(l1, l2);
              
              sats.push({
                name: localInfo.name || name, // Use local name if it exists
                noradId, 
                satrec,
                type: localInfo.type,
                description: localInfo.description,
                imageUrl: localInfo.imageUrl,
              });
            } catch {}
          }
          return sats;
        } catch (e) { return []; }
      };
      
      const [featuredResults, bulkResult] = await Promise.allSettled([ Promise.all(featuredPromises), bulkSatsPromise() ]);
      const validFeaturedSats = featuredResults.status === 'fulfilled' ? featuredResults.value.filter(Boolean) : [];
      const bulkSats = bulkResult.status === 'fulfilled' ? bulkResult.value : [];
      const featuredNoradIds = new Set(validFeaturedSats.map(s => s.noradId));
      const uniqueBulkSats = bulkSats.filter(s => !featuredNoradIds.has(s.noradId));
      const allSatellites = [...validFeaturedSats, ...uniqueBulkSats];
      
      console.log(`Now tracking ${allSatellites.length} unique satellites.`);

      // The rest of the logic is unchanged and correct
      const computePositions = () => {
        const now = new Date();
        const gmst = satellite.gstime(now);
        const positions = allSatellites.map((sat) => {
            try {
              const pv = satellite.propagate(sat.satrec, now);
              if (!pv?.position || !pv?.velocity) return null;
              const gd = satellite.eciToGeodetic(pv.position, gmst);
              const velocity = pv.velocity;
              const speed = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2) + Math.pow(velocity.z, 2));
              const lat = satellite.degreesLat(gd.latitude);
              const lon = satellite.degreesLong(gd.longitude);
              if (isNaN(lat) || isNaN(lon)) return null;
              // Pass ALL the data through to the final state
              return { ...sat, lat, lon, speed };
            } catch (e) { return null; }
        }).filter(Boolean);
        setSatellitePositions(positions);
      };
      computePositions();
      const positionInterval = setInterval(computePositions, 2000);
      return () => { if (positionInterval) clearInterval(positionInterval); };
    }

    initializeTracker();
  }, []);

  // Click handlers and data lookup are unchanged and correct
  const handleMarkerClick = (satellite) => { setSelectedSatelliteId(satellite.noradId); };
  const handleClosePanel = () => { setSelectedSatelliteId(null); };
  const selectedSatellite = selectedSatelliteId 
    ? satellitePositions.find(s => s.noradId === selectedSatelliteId) 
    : null;

  return (
    <div className="h-screen w-screen">
      <MapContainer center={[0, 0]} zoom={2} minZoom={2} maxZoom={18} scrollWheelZoom={true} worldCopyJump={true} maxBounds={maxBounds} maxBoundsViscosity={1.0} className="h-full w-screen z-0">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" attribution='© <a href="https://carto.com/">CARTO</a> | OpenStreetMap contributors' noWrap={false}/>
        {satellitePositions.map((s) => (
          <Marker
            key={s.noradId}
            position={[s.lat, s.lon]}
            icon={getIcon(s)}
            eventHandlers={{ click: () => handleMarkerClick(s) }}
          />
        ))}
      </MapContainer>
      <SatelliteInfoPanel 
        satellite={selectedSatellite} 
        onClose={handleClosePanel} 
      />
    </div>
  );
}