// src/SatelliteMarkers.jsx
import React, { useEffect } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// --- All of your icon definitions will now live here ---
const highlightIcon = L.divIcon({
  className: 'satellite-highlight',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
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

// The main component
export default function SatelliteMarkers({ positions, onMarkerClick, searchedId, satelliteInfo }) {
  const map = useMap(); // Get a reference to the parent map instance
  
  const getIcon = (sat) => {
    const localInfo = satelliteInfo[sat.noradId];
    if (localInfo?.type === 'iss') return issIcon;
    if (localInfo?.type === 'hubble') return hubbleIcon;
    return defaultSatelliteIcon;
  };
  
  const searchedPosition = searchedId ? positions.find(s => s.noradId === searchedId) : null;

  // Optional: When a new satellite is searched, pan the map to it
  useEffect(() => {
    if (searchedPosition) {
      map.panTo([searchedPosition.latitude, searchedPosition.longitude]);
    }
  }, [searchedPosition, map]);


  return (
    <>
      {positions.map((s) => (
        <Marker
          key={s.noradId}
          position={[s.latitude, s.longitude]}
          icon={getIcon(s)}
          eventHandlers={{ click: () => onMarkerClick(s) }}
        />
      ))}

      {searchedPosition && (
        <Marker
          key={`highlight-${searchedPosition.noradId}`}
          position={[searchedPosition.latitude, searchedPosition.longitude]}
          icon={highlightIcon}
          zIndexOffset={1000}
          interactive={false}
        />
      )}
    </>
  );
}