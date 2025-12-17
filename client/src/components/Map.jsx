import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const riderIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Bike icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Component to auto-center map
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const Map = ({ order }) => {
    // Default center (San Francisco for demo if no data)
    const defaultCenter = [28.6139, 77.2090]; // Delhi

    const currentLocation = order?.currentLocation ? [order.currentLocation.lat, order.currentLocation.lng] : defaultCenter;

    // Hardcoding demo locations if missing
    const storePos = [28.6139, 77.2090];
    const riderPos = currentLocation;
    const destPos = [28.62, 77.22]; // Slightly away

    return (
        <div className="h-full w-full bg-slate-900">
            <MapContainer center={riderPos} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
                <ChangeView center={riderPos} zoom={15} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Rider */}
                <Marker position={riderPos} icon={riderIcon}>
                    <Popup className="custom-popup">
                        <div className="text-center">
                            <p className="font-bold text-slate-900">Your Rider</p>
                            <p className="text-xs text-slate-500">On the way!</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Route Line (Demo) */}
                <Polyline positions={[storePos, riderPos, destPos]} color="#8b5cf6" weight={4} dashArray={[10, 10]} opacity={0.7} />

            </MapContainer>
        </div>
    );
};

export default Map;
