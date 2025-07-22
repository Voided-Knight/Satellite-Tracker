import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Define strict vertical bounds but allow infinite horizontal panning
const maxBounds = [
  [-85, -Infinity], // South limit, infinite west
  [85, Infinity],   // North limit, infinite east
];

function App() {
  return (
    <div className="h-screen w-screen">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom={true}
        worldCopyJump={true}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        keepBuffer={3}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> | OpenStreetMap contributors'
          noWrap={false}
          updateWhenZooming={false}
          updateWhenIdle={true}
        />
        <Marker position={[28.6139, 77.2090]}>
          <Popup>
            <strong>Satellite Name</strong><br />
            Speed: 7.66 km/s<br />
            Altitude: 420 km<br />
            Lat: 28.61<br />
            Lon: 77.20<br />
            Mission: Earth Observation
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;
