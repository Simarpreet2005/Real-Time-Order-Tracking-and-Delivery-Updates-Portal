import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Package, MapPin, CheckCircle2, Navigation } from 'lucide-react';

const socket = io('http://localhost:5000');

const RiderDashboard = ({ onLogout }) => {
    const [orders, setOrders] = useState([]);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        // Join rider-specific room
        const userId = user._id || user.id;
        socket.emit('joinRiderRoom', userId);

        const fetchOrders = async () => {
            try {
                const userId = user._id || user.id;
                const res = await axios.get(`http://localhost:5000/api/orders/rider/${userId}`);
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrders();

        // Listen for new assignments
        socket.on('orderAssigned', (newOrder) => {
            // Play notification sound if desired
            setOrders(prev => [newOrder, ...prev]);
            alert(`New Order Assigned: #${newOrder.trackingId}`);
        });

        return () => {
            socket.off('orderAssigned');
        };
    }, [user._id]);

    useEffect(() => {
        let watchId;
        const activeOrders = orders.filter(o => o.status === 'Out for Delivery');

        if (activeOrders.length > 0 && "geolocation" in navigator) {
            console.log("Starting GPS tracking for orders:", activeOrders.map(o => o.trackingId));
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    activeOrders.forEach(order => {
                        socket.emit('updateLocation', {
                            trackingId: order.trackingId,
                            location: { lat: latitude, lng: longitude }
                        });
                    });
                },
                (err) => console.error("GPS Error:", err),
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [orders]);

    const handleStatusUpdate = async (trackingId, nextStatus) => {
        try {
            // Get current location for the initial status update
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    let addressText = "Current GPS Location";
                    try {
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                        const geoData = await geoRes.json();
                        addressText = geoData.display_name;
                    } catch (e) {
                        console.error("Geocoding failed", e);
                    }

                    const location = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        address: addressText
                    };

                    await axios.put(`http://localhost:5000/api/orders/${trackingId}/status`, {
                        status: nextStatus,
                        location
                    });

                    // Refresh orders to trigger the watchPosition useEffect
                    const res = await axios.get(`http://localhost:5000/api/orders/rider/${user._id}`);
                    setOrders(res.data);
                });
            } else {
                // Fallback if no geolocation
                await axios.put(`http://localhost:5000/api/orders/${trackingId}/status`, {
                    status: nextStatus
                });
                const res = await axios.get(`http://localhost:5000/api/orders/rider/${user._id}`);
                setOrders(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Navigation className="text-red-500" />
                    Delivery Dashboard
                </h1>
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
