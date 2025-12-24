import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

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

// Custom Icons
const riderIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Bike icon
    iconSize: [25, 25],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const warehouseIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', // Warehouse/Store icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const homeIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/619/619153.png', // Home/Location icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

// Component to handle map view control
function MapController({ center, zoom, autoCenter }) {
    const map = useMap();
    const prevCenterRef = useRef(null);

    useEffect(() => {
        if (autoCenter && center && center.length === 2) {
            const [lat, lng] = center;
            // Only fly if center effectively changed or first load
            if (!prevCenterRef.current || prevCenterRef.current[0] !== lat || prevCenterRef.current[1] !== lng) {
                map.flyTo(center, zoom, { duration: 1.5 });
                prevCenterRef.current = center;
            }
        }
    }, [center, zoom, autoCenter, map]);
    return null;
}

const Map = ({ order }) => {
    // Default center (Warehouse fixed location)
    const defaultCenter = [31.28650278795713, 75.64906612235929];
    const [autoCenter, setAutoCenter] = useState(true);
    const [bearing, setBearing] = useState(0);
    const prevPosRef = useRef(null);

    // Memoize rider position to prevent reference churn and validate numbers
    const riderPos = React.useMemo(() => {
        if (order?.currentLocation?.lat !== undefined && order?.currentLocation?.lng !== undefined) {
            const lat = parseFloat(order.currentLocation.lat);
            const lng = parseFloat(order.currentLocation.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
                return [lat, lng];
            }
        }
        return defaultCenter;
    }, [order?.currentLocation?.lat, order?.currentLocation?.lng]); // Dependency on individual values

    // Simplified Animation State - Direct Updates
    // We just track the previous valid position for bearing calculation
    useEffect(() => {
        if (riderPos) {
            // Calculate Bearing based on change from PREVIOUS position to CURRENT position
            if (prevPosRef.current) {
                const [lat1, lng1] = prevPosRef.current;
                const [lat2, lng2] = riderPos;

                // Simple distance check to avoid rotation on tiny jitter/noise
                // Increased threshold slightly to avoid fluttering
                if (Math.abs(lat1 - lat2) > 0.00001 || Math.abs(lng1 - lng2) > 0.00001) {
                    const toRad = degree => degree * Math.PI / 180;
                    const toDeg = rad => rad * 180 / Math.PI;

                    const dLon = toRad(lng2 - lng1);
                    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
                    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
                        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

                    let brng = toDeg(Math.atan2(y, x));
                    if (brng < 0) brng += 360;

                    setBearing(brng);
                }
            }
            // Update previous position ref for NEXT time
            prevPosRef.current = riderPos;
        }
    }, [riderPos[0], riderPos[1]]); // Trigger on new target position

    const handleRecenter = () => setAutoCenter(true);

    const routePositions = React.useMemo(() => {
        return order?.route ? order.route.map(p => [p.lat, p.lng]) : [];
    }, [order?.route]);

    let customerPos = null;
    if (routePositions.length > 0) {
        customerPos = routePositions[routePositions.length - 1];
    }

    // Dynamic Rider Icon
    const getRiderIcon = (rotation) => L.divIcon({
        className: 'custom-rider-icon',
        html: `<img src="/delivery-agent.png" style="transform: rotate(${rotation}deg); width: 50px; height: 50px; display: block;" />`,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -25]
    });

    return (
        <div className="h-full w-full bg-slate-900 border-l border-slate-200 relative">
            <MapContainer
                center={riderPos} // Use direct pos
                zoom={15}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <MessagesHandler onDrag={() => setAutoCenter(false)} />
                <MapController center={riderPos} zoom={16} autoCenter={autoCenter} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={defaultCenter} icon={warehouseIcon}>
                    <Popup>Warehouse</Popup>
                </Marker>

                {customerPos && (
                    <Marker position={customerPos} icon={homeIcon}>
                        <Popup>Customer</Popup>
                    </Marker>
                )}

                <Marker position={riderPos} icon={getRiderIcon(bearing)}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold text-slate-900">Delivery Agent</p>
                            <p className="text-xs text-slate-500">Live Tracking</p>
                        </div>
                    </Popup>
                </Marker>

                {routePositions.length > 0 && (
                    <Polyline
                        positions={routePositions}
                        color="#3b82f6"
                        weight={6}
                        opacity={0.8}
                        lineCap="round"
                    />
                )}
            </MapContainer>

            {!autoCenter && (
                <button
                    onClick={handleRecenter}
                    className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm z-[1000] flex items-center gap-2 hover:bg-slate-800 transition-all animate-in fade-in slide-in-from-bottom-4"
                >
                    <Navigation className="w-4 h-4" />
                    Re-center
                </button>
            )}
        </div>
    );
};

// Helper component to listen to map events
function MessagesHandler({ onDrag }) {
    const map = useMap();
    useEffect(() => {
        map.on('dragstart', onDrag);
        map.on('zoomstart', onDrag); // Also stop auto-center on manual zoom
        return () => {
            map.off('dragstart', onDrag);
            map.off('zoomstart', onDrag);
        };
    }, [map, onDrag]);
    return null;
}

export default Map;
