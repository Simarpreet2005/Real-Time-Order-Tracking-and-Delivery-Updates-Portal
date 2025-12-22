import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, ChevronRight, ShoppingBag, MapPin } from 'lucide-react';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        const fetchOrders = async () => {
            try {
                // Use user._id or user.id depending on what's stored
                const userId = user._id || user.id;
                const res = await axios.get(`http://localhost:5000/api/orders/user/${userId}`);
                setOrders(res.data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6" />
                    My Orders
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                        <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No orders yet</h3>
                        <p className="text-slate-500 text-sm mb-6">Looks like you haven't placed any orders yet.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.trackingId}
                                onClick={() => navigate(`/track/${order.trackingId}`)}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-2.5 rounded-xl">
                                            <Package className="w-6 h-6 text-slate-700" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">#{order.trackingId}</p>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${order.status === 'Delivered'
                                            ? 'bg-green-100 text-green-700'
                                            : order.status === 'Cancelled'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="pl-[52px]">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="line-clamp-1">{order.customer?.address || 'Delivery Address'}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:underline">
                                        View Details <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
