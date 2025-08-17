import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import SatelliteBar from "./SatelliteBar";
import L from "leaflet";

const SatelliteMap = ({ satellites }) => {
  const [highlightedId, setHighlightedId] = useState(null);
  const mapRef = useRef();

  const handleSearch = (noradId) => {
    const sat = satellites.find((s) => String(s.noradId) === noradId);
    if (sat) {
      setHighlightedId(sat.noradId);
      if (mapRef.current) {
        mapRef.current.setView([sat.lat, sat.lng], 4);
      }
      return true; // valid
    }
    return false; // invalid
  };

  const handleClear = () => {
    setHighlightedId(null);
  };

  return (
    <div>
      <SatelliteBar
        onSearch={handleSearch}
        onClear={handleClear}
        highlightedId={highlightedId}
      />

      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: "600px", width: "100%" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {satellites.map((sat) => (
          <Marker
            key={sat.noradId}
            position={[sat.lat, sat.lng]}
            icon={
              highlightedId === sat.noradId
                ? new L.DivIcon({
                    className: "highlighted-sat",
                    html: `<div style="border: 2px solid red; border-radius: 4px; padding: 2px;">📡</div>`,
                  })
                : new L.DivIcon({
                    className: "sat",
                    html: `<div>📡</div>`,
                  })
            }
          >
            <Popup>
              <b>{sat.name}</b> <br />
              NORAD: {sat.noradId}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SatelliteMap;