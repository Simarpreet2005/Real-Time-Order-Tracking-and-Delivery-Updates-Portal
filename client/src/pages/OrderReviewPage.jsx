import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, MapPin, CreditCard, ChevronLeft, Clock, ShieldCheck, Home } from 'lucide-react';

const OrderReviewPage = ({ cart }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 15; // standard fee
    const platformFee = 2;
    const total = subtotal + deliveryFee + platformFee;

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // Create order via API
            const user = JSON.parse(localStorage.getItem('user'));
            const orderData = {
                trackingId: `ORD-${Date.now()}`,
                customerId: user._id || user.id,
                customer: {
                    name: user?.name || 'Guest User',
                    address: localStorage.getItem('deliveryAddress') || '123, Green Street, Tech City'
                },
                initialLocation: { lat: 28.6139, lng: 77.2090, address: 'Dark Store #1' },
                items: cart
            };

            const res = await axios.post('http://localhost:5000/api/orders', orderData);
            navigate(`/track/${res.data.trackingId}`);
        } catch (err) {
            console.error(err);
            // Fallback for demo if backend is down
            const fallbackId = `ORD-${Date.now()}`;
            navigate(`/track/${fallbackId}`);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <CreditCard className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 mb-8 max-w-xs text-center">Add items from the home page to start your express delivery.</p>
                <button
                    onClick={() => navigate('/')}
                    className="p-4 px-8 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary/30"
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            {/* Header */}
            <div className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <ChevronLeft className="h-6 w-6 text-slate-800" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-slate-900 leading-none">Checkout</h1>
                        <span className="text-xs text-slate-500 font-medium">{cart.length} items • Total ₹{total}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-6 mt-2">

                {/* Delivery Section */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-600"></div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-xl">
                                <Home className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Delivery at Home</h3>
                                <p className="text-xs text-slate-500">{localStorage.getItem('deliveryAddress') || '123, Green Street, Tech City'}</p>
                            </div>
                        </div>
                        <button className="text-primary text-xs font-bold uppercase tracking-wide hover:underline">Change</button>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>Delivery in 8 minutes</span>
                    </div>
                </div>

                {/* Items Summary */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 text-sm">Items Added</h3>
                        <button className="text-primary text-xs font-bold uppercase tracking-wide" onClick={() => navigate('/')}>+ Add more</button>
                    </div>
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center p-1">
                                            <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-slate-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">{item.quantity}</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{item.name}</span>
                                        <span className="text-xs text-slate-400">{item.weight}</span>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-900">₹{(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bill Details */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm mb-4">Bill Details</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-500">
                            <span>Item Total</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <div className="flex items-center gap-1">
                                <span>Delivery Fee</span>
                                <ShieldCheck className="w-3 h-3 text-primary" />
                            </div>
                            <span>₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                        </div>
                        <div className="border-t border-slate-100 my-2 pt-3 flex justify-between items-center">
                            <span className="font-bold text-slate-900 text-base">To Pay</span>
                            <span className="font-bold text-slate-900 text-lg">₹{total}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-100/50 p-4 rounded-xl text-xs text-slate-400 text-center leading-relaxed">
                    By placing an order, you agree to our Terms and Conditions.
                    Your order will be delivered by a partner delivery executive.
                </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="fixed bottom-0 w-full bg-white border-t border-slate-100 p-4 pb-6 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</span>
                        <span className="text-xl font-bold text-slate-900">₹{total}</span>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-between px-6 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        <span className="text-white/90 text-sm font-medium">Click to pay</span>
                        <span className="flex items-center gap-2 text-base">
                            {loading ? 'Processing...' : 'Place Order'}
                            {!loading && <ArrowRight className="h-5 w-5" />}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderReviewPage;
