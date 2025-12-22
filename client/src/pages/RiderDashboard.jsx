import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Package, MapPin, CheckCircle2, Navigation } from 'lucide-react';

const socket = io('http://localhost:5000');

const RiderDashboard = ({ onLogout }) => {
    const [orders, setOrders] = useState([]);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [gpsStatus, setGpsStatus] = useState('idle'); // idle, searching, active, error


    useEffect(() => {
        const userId = user._id || user.id;

        const joinRoom = () => {
            console.log("Joining rider room:", userId);
            socket.emit('joinRiderRoom', userId);
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on('connect', joinRoom);

        const fetchOrders = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/rider/${userId}`);
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrders();

        // Listen for new assignments
        socket.on('orderAssigned', (newOrder) => {
            console.log("Received new order assignment:", newOrder);
            setOrders(prev => [newOrder, ...prev]);
            alert(`New Order Assigned: #${newOrder.trackingId}`);
        });

        return () => {
            socket.off('connect', joinRoom);
            socket.off('orderAssigned');
        };
    }, [user._id, user.id]);

    useEffect(() => {
        let watchId;
        const activeOrders = orders.filter(o => o.status === 'Out for Delivery');

        if (activeOrders.length > 0 && "geolocation" in navigator) {
            console.log("Starting GPS tracking for orders:", activeOrders.map(o => o.trackingId));
            setGpsStatus('searching');

            const errorCallback = (err) => {
                console.error("GPS Watch Error:", err.message);

                if (err.code === err.PERMISSION_DENIED) {
                    setGpsStatus('error');
                    console.error("Permission denied for GPS tracking.");
                    // Stop trying if permission is denied
                    if (watchId) navigator.geolocation.clearWatch(watchId);
                    return;
                }

                if (highAccuracyMode) {
                    // Fallback to low accuracy if high fails
                    console.log("High accuracy failed, switching to low accuracy...");
                    highAccuracyMode = false;
                    if (watchId) navigator.geolocation.clearWatch(watchId);
                    startWatch(false);
                } else {
                    // Even low accuracy failed, just log it but keep trying (maybe temporary signal loss)
                    setGpsStatus('error');
                }
            };

            let highAccuracyMode = true;

            const startWatch = (highAccuracy) => {
                watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        console.log(`[GPS UPDATE] Lat: ${latitude}, Lng: ${longitude} (Accuracy: ${pos.coords.accuracy}m)`);

                        // Only update if we have meaningful coordinates
                        if (latitude && longitude) {
                            setGpsStatus('active');
                            activeOrders.forEach(order => {
                                socket.emit('updateLocation', {
                                    trackingId: order.trackingId,
                                    location: { lat: latitude, lng: longitude }
                                });
                            });
                        }
                    },
                    errorCallback,
                    {
                        enableHighAccuracy: highAccuracy,
                        maximumAge: 0, // Force fresh data
                        timeout: 10000
                    }
                );
            };

            startWatch(true);
        } else {
            console.log("No active orders or GPS not supported.");
            if (!("geolocation" in navigator)) {
                console.error("Geolocation is not supported by this browser.");
                setGpsStatus('error');
            }
        }

        return () => {
            if (watchId) {
                console.log("Stopping GPS tracking");
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [orders]);

    const handleStatusUpdate = async (trackingId, nextStatus) => {
        try {
            console.log(`Updating status to ${nextStatus} for ${trackingId}`);

            const updateStatus = async (location = null) => {
                const payload = { status: nextStatus };
                if (location) payload.location = location;

                try {
                    await axios.put(`http://localhost:5000/api/orders/${trackingId}/status`, payload);
                    const res = await axios.get(`http://localhost:5000/api/orders/rider/${user._id}`);
                    setOrders(res.data);
                } catch (apiErr) {
                    console.error("API update failed:", apiErr);
                    alert("Failed to update status on server.");
                }
            };

            const getAddress = async (lat, lng) => {
                try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    if (!geoRes.ok) throw new Error("Nominatim API Error");
                    const geoData = await geoRes.json();
                    return geoData.display_name;
                } catch (e) {
                    console.error("Geocoding failed", e);
                    return "GPS Location";
                }
            };

            if ("geolocation" in navigator) {
                // Strategy: Try High Accuracy -> Fail -> Try Low Accuracy -> Fail -> No Location

                const getPosition = (options) => {
                    return new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, options);
                    });
                };

                try {
                    // Attempt 1: High Accuracy (10s timeout)
                    console.log("Attempting High Accuracy GPS...");
                    const pos = await getPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }); // MaximumAge 0 to force fresh reading
                    const address = await getAddress(pos.coords.latitude, pos.coords.longitude);
                    await updateStatus({ lat: pos.coords.latitude, lng: pos.coords.longitude, address });

                } catch (err1) {
                    console.warn("High Accuracy GPS failed:", err1.message);

                    // If permission denied, do not retry
                    if (err1.code === err1.PERMISSION_DENIED) {
                        console.error("User denied Geolocation permission.");
                        alert("Please enable location services to deliver orders.");
                        await updateStatus(null);
                        return;
                    }

                    try {
                        // Attempt 2: Low Accuracy (10s timeout)
                        console.log("Retrying with Low Accuracy GPS...");
                        const pos = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
                        const address = await getAddress(pos.coords.latitude, pos.coords.longitude);
                        await updateStatus({ lat: pos.coords.latitude, lng: pos.coords.longitude, address });

                    } catch (err2) {
                        console.error("All GPS attempts failed:", err2.message);
                        if (err2.code === err2.PERMISSION_DENIED) {
                            alert("Please enable location services to deliver orders.");
                        }
                        console.log("Proceeding without location.");
                        // Attempt 3: No Location
                        await updateStatus(null);
                    }
                }
            } else {
                console.log("Geolocation not supported by browser.");
                await updateStatus(null);
            }
        } catch (err) {
            console.error("Critical error in logic:", err);
            alert("Unexpected error. Please try again.");
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Navigation className="text-red-500" />
                    Delivery Dashboard
                </h1>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${gpsStatus === 'active' ? 'bg-green-100 text-green-600' :
                    gpsStatus === 'searching' ? 'bg-yellow-100 text-yellow-600' :
                        gpsStatus === 'error' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-500'
                    }`}>
                    GPS: {gpsStatus.toUpperCase()}
                </div>
                <button
                    onClick={onLogout}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors"
                >
                    Logout
                </button>
            </div>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600">No orders assigned yet</h3>
                        <p className="text-gray-400">Wait for admin to assign you a task.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {order.trackingId}</span>
                                    <h3 className="text-xl font-bold mt-1">{order.customer.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                                        <MapPin className="h-4 w-4" />
                                        {order.customer.address}
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {order.status}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                {order.status === 'Packed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.trackingId, 'Out for Delivery')}
                                        className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        Start Delivery
                                    </button>
                                )}
                                {order.status === 'Out for Delivery' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.trackingId, 'Delivered')}
                                        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RiderDashboard;
