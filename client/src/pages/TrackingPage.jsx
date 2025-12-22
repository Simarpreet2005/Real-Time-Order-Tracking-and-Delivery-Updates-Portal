import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, MapPin, Navigation, ChevronLeft, Phone, MessageCircle } from 'lucide-react';
import Map from '../components/Map';

const TrackingPage = () => {
    const { trackingId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const socket = io('http://localhost:5000');

        // Initial fetch
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/${trackingId}`);
                setOrder(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                // Demo Mode Fallback
                setOrder({
                    trackingId: trackingId || 'DEMO-123',
                    status: 'Out for Delivery',
                    customer: { address: '123, Green Street, Tech City' }
                });
                setLoading(false);
            }
        };

        fetchOrder();

        // Join room
        socket.emit('joinOrder', trackingId);

        socket.on('orderUpdated', (updatedOrder) => {
            console.log('[DEBUG] TrackingPage received orderUpdated:', updatedOrder);
            setOrder(updatedOrder);
        });

        socket.on('locationUpdate', (newLocation) => {
            console.log('Received locationUpdate:', newLocation);
            setOrder(prev => prev ? ({
                ...prev,
                currentLocation: {
                    ...prev.currentLocation,
                    ...newLocation
                }
            }) : prev);
        });

        return () => socket.disconnect();
    }, [trackingId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Connecting to GPS...</div>;

    const steps = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(order?.status || 'Ordered');

    return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col md:flex-row h-screen overflow-hidden">

            {/* Left Sidebar: Status & Info */}
            <div className="w-full md:w-[400px] bg-white shadow-xl z-20 flex flex-col h-full overflow-y-auto">
                <div className="bg-slate-900 text-white p-6 pb-12 rounded-b-[2rem] md:rounded-b-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Truck className="w-32 h-32" />
                    </div>

                    <button onClick={() => navigate('/')} className="mb-6 hover:bg-white/10 p-2 rounded-full w-fit transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <h1 className="text-3xl font-bold mb-2 mt-4">Arriving in 8 mins</h1>
                    <p className="text-slate-400 text-sm mb-8">On time • 12:42 PM</p>

                    <div className="mt-4 flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 flex items-center gap-4 border border-white/10">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-base text-white truncate">{order?.deliveryPersonId?.name || 'Assigned Rider'}</p>
                                <p className="text-sm text-slate-300 truncate">{order?.deliveryPersonId?.email || 'Valet'}</p>
                            </div>
                        </div>
                        <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shrink-0">
                            <Phone className="w-5 h-5 text-white" />
                        </button>
                    </div>


                </div>

                <div className="p-6 flex-1">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Live Status
                    </h3>

                    <div className="relative pl-4 space-y-8 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step} className="relative flex items-center gap-4 z-10">
                                    <div className={`w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-green-500 border-green-500 box-content' : 'bg-slate-200 border-slate-200'} ${isCurrent ? 'ring-4 ring-green-100' : ''}`} />
                                    <div className={`${isCurrent ? 'opacity-100' : 'opacity-60'}`}>
                                        <p className={`text-sm font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{step}</p>
                                        {isCurrent && <p className="text-[10px] text-green-600 font-medium animate-pulse">Happening now</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Deliver to</p>
                        <div className="flex gap-2 items-start">
                            <MapPin className="w-4 h-4 text-slate-900 mt-0.5" />
                            <p className="text-sm font-medium text-slate-900">{order?.customer?.address}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Map Area */}
            <div className="flex-1 bg-slate-200 relative">
                <Map order={order} />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg text-xs font-bold z-[1000] border border-white/50">
                    Live GPS Tracking
                </div>
            </div>

        </div>
    );
};

export default TrackingPage;
