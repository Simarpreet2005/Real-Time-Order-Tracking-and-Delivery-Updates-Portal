import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom icon setup removed for debugging
// Fix for default Leaflet marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to smoothly animate map center
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], 14, {
            animate: true,
            duration: 1.5
        });
    }, [lat, lng, map]);
    return null;
};

const MapVisual = ({ location, history }) => {
    // Default to New York if no location
    const position = location && location.lat && location.lng
        ? [location.lat, location.lng]
        : [40.7128, -74.0060];

    // Extract path history for Polyline
    // Filter history items that have valid coordinates (assuming we store them in history too, 
    // currently we might not be storing lat/lng in history in the backend model perfectly, 
    // but let's handle what we have or default to current pos).
    // NOTE: Simple version - just show current point. 
    // To show full path, we'd need to update backend to save lat/lng in history array.
    // For now, let's just make the current view awesome.

    return (
        <div className="h-96 w-full rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative z-0">
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', background: '#111' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={position}>
                    <Popup className="custom-popup">
                        <div className="text-gray-900 font-semibold">
                            Current Location <br />
                            <span className="text-gray-500 text-xs">{location?.address || 'On the move...'}</span>
                        </div>
                    </Popup>
                </Marker>
                <RecenterMap lat={position[0]} lng={position[1]} />
            </MapContainer>

            {/* Overlay status pill */}
            <div className="absolute top-4 right-4 z-[400] bg-gray-900/90 backdrop-blur border border-gray-700 px-4 py-2 rounded-lg shadow-xl">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-300">LIVE FEED</span>
                </div>
            </div>
        </div>
    );
};

export default MapVisual;
