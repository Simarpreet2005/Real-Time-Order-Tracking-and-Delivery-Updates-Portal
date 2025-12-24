import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ShieldCheck, Clock, Loader2 } from 'lucide-react';

const PaymentVerificationPage = () => {
    const { trackingId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/${trackingId}`);
                setOrder(res.data);

                // If already verified and assigned, redirect immediately
                if (res.data.paymentStatus === 'Success' && res.data.deliveryPersonId) {
                    navigate(`/track/${trackingId}`);
                }
            } catch (err) {
                setError('Failed to fetch order details.');
                console.error(err);
            }
        };

        fetchOrder();

        const socket = io('http://localhost:5000');
        socket.emit('joinOrderRoom', trackingId);

        socket.on('orderUpdated', (updatedOrder) => {
            setOrder(updatedOrder);
            // Check redirect condition: Payment Success AND Rider Assigned
            if (updatedOrder.paymentStatus === 'Success' && updatedOrder.deliveryPersonId) {
                navigate(`/track/${trackingId}`);
            }
        });

        return () => socket.disconnect();
    }, [trackingId, navigate]);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                    <p className="text-red-500 font-bold mb-2">Error</p>
                    <p className="text-slate-600">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (!order) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full text-center space-y-6">

                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto relative">
                    <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                    <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-slate-400" />
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Verification</h1>
                    <p className="text-slate-500 text-sm">
                        Please wait while your payment is verified and a delivery partner is assigned.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm border border-slate-100">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Order ID</span>
                        <span className="font-mono font-bold text-slate-900">#{order.trackingId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Payment Status</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${order.paymentStatus === 'Success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.paymentStatus || 'Pending'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Rider Assignment</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${order.deliveryPersonId ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {order.deliveryPersonId ? 'Assigned' : 'Pending'}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 text-blue-700 text-xs rounded-xl font-medium leading-relaxed">
                    You will be automatically redirected to the tracking page once the verification is complete.
                </div>
            </div>
        </div>
    );
};

export default PaymentVerificationPage;
