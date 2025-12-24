import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, MapPin, CreditCard, ChevronLeft, Clock, ShieldCheck, Home, AlertCircle } from 'lucide-react';

const OrderReviewPage = ({ cart, clearCart }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [plusCode, setPlusCode] = useState('');
    const [label, setLabel] = useState('Home');
    const [saveAddress, setSaveAddress] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
    const [error, setError] = useState(null);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('COD'); // 'UPI', 'CARD', 'COD'
    const [upiId, setUpiId] = useState('');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

    // Fetch user addresses on mount
    React.useEffect(() => {
        const fetchAddresses = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user._id) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/auth/${user._id}`);
                    if (res.data.addresses) {
                        setAddresses(res.data.addresses);
                    }
                } catch (err) {
                    console.error("Failed to fetch addresses", err);
                }
            }
        };
        fetchAddresses();
    }, []);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 15;
    const platformFee = 2;
    const total = subtotal + deliveryFee + platformFee;

    const handlePlaceOrder = async () => {
        const finalPlusCode = selectedAddressIndex >= 0 ? addresses[selectedAddressIndex].plusCode : plusCode;

        if (!finalPlusCode) {
            setError('Please enter or select a delivery location (Plus Code).');
            return;
        }

        // Payment Validation
        if (paymentMethod === 'UPI' && !upiId.includes('@')) {
            setError('Please enter a valid UPI ID (e.g., user@bank).');
            return;
        }
        if (paymentMethod === 'CARD') {
            if (cardDetails.number.length !== 16) {
                setError('Card number must be 16 digits.');
                return;
            }
            if (!cardDetails.expiry.includes('/')) {
                setError('Expiry must be MM/YY.');
                return;
            }
            if (cardDetails.cvv.length !== 3) {
                setError('CVV must be 3 digits.');
                return;
            }
        }

        setLoading(true);
        setError(null);

        // Simulate Payment Delay for Online Methods
        if (paymentMethod !== 'COD') {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            // Auto-save address if checked (and not using a saved one)
            if (saveAddress && selectedAddressIndex === -1 && user && user._id) {
                try {
                    await axios.post('http://localhost:5000/api/auth/address', {
                        userId: user._id,
                        label: label || 'Saved Address',
                        plusCode: finalPlusCode
                    });
                } catch (saveErr) {
                    console.error("Failed to save address", saveErr);
                }
            }

            const orderData = {
                trackingId: `ORD-${Date.now()}`,
                customerId: user._id || user.id,
                customer: {
                    name: user?.name || 'Guest User',
                    plusCode: finalPlusCode
                },
                items: cart,
                paymentMethod: paymentMethod,
                paymentStatus: 'Pending' // All payments are Pending until verified by Admin (or COD fulfilled)
            };

            const res = await axios.post('http://localhost:5000/api/orders', orderData);

            // SYNC FIX: Update the Navbar address to reflect this new delivery location
            const addressLabel = selectedAddressIndex >= 0
                ? `${addresses[selectedAddressIndex].label} (${addresses[selectedAddressIndex].plusCode})`
                : label ? `${label} (${finalPlusCode})` : finalPlusCode;

            localStorage.setItem('deliveryAddress', addressLabel);
            // We can't easily trigger a re-render in Navbar from here without Context, 
            // but next time Navbar mounts or checks localStorage it will be correct.
            // For a SPA, a window event dispatch can work:
            window.dispatchEvent(new Event('storage'));

            clearCart();

            // Redirect Logic: COD -> Track, Online -> Verify
            if (paymentMethod === 'COD') {
                navigate(`/track/${res.data.trackingId}`);
            } else {
                navigate(`/verify/${res.data.trackingId}`);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to place order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ... (Empty cart check remains same) ...

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

                    <h3 className="font-bold text-slate-900 text-sm mb-3">Delivery Location</h3>

                    {/* Address Selection Tabs */}
                    {addresses.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setSelectedAddressIndex(-1)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedAddressIndex === -1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                New Address
                            </button>
                            {addresses.map((addr, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedAddressIndex(idx)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedAddressIndex === idx ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {addr.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedAddressIndex === -1 ? (
                        <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Enter Plus Code</label>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="text-slate-400 w-5 h-5 absolute ml-3 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={plusCode}
                                        onChange={(e) => setPlusCode(e.target.value)}
                                        placeholder="e.g. 7JPX+JJ8"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:font-normal"
                                    />
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <input
                                        type="checkbox"
                                        id="saveAddr"
                                        checked={saveAddress}
                                        onChange={(e) => setSaveAddress(e.target.checked)}
                                        className="rounded text-primary focus:ring-primary h-4 w-4"
                                    />
                                    <label htmlFor="saveAddr" className="text-xs font-bold text-slate-700 select-none cursor-pointer flex-1">Save this address for future?</label>
                                </div>

                                {saveAddress && (
                                    <input
                                        type="text"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        placeholder="Label (e.g. Home, Office)"
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-primary"
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <Home className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{addresses[selectedAddressIndex].label}</p>
                                <p className="text-xs text-slate-500 font-mono">{addresses[selectedAddressIndex].plusCode}</p>
                            </div>
                            <div className="ml-auto">
                                <span className="text-[10px] font-bold bg-green-200 text-green-800 px-2 py-1 rounded-full">Selected</span>
                            </div>
                        </div>
                    )}

                    <p className="text-[10px] text-slate-400 mt-2 ml-1">
                        Warehouse Location: <span className="font-mono font-bold text-slate-500">7JPX+JJ8</span>.
                        Delivery within <span className="text-primary font-bold">3 KM</span> radius only.
                    </p>

                    {error && (
                        <div className="mb-4 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p className="text-xs font-semibold">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span>Delivery in ~15-30 minutes</span>
                    </div>
                </div>

                {/* Simulated Payment Section */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm mb-4">Payment Method</h3>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <button
                            onClick={() => setPaymentMethod('UPI')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'UPI' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                        >
                            <span className="font-bold text-xs">UPI</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('CARD')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CARD' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                        >
                            <span className="font-bold text-xs">Card</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('COD')}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                        >
                            <span className="font-bold text-xs">COD</span>
                        </button>
                    </div>

                    {paymentMethod === 'UPI' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Enter UPI ID</label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="e.g. username@okhdfcbank"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            <p className="text-[10px] text-slate-400">Verifying secure UPI handle...</p>
                        </div>
                    )}

                    {paymentMethod === 'CARD' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        maxLength="16"
                                        value={cardDetails.number}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setCardDetails({ ...cardDetails, number: val });
                                        }}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Expiry</label>
                                    <input
                                        type="text"
                                        maxLength="5"
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">CVV</label>
                                    <input
                                        type="password"
                                        maxLength="3"
                                        value={cardDetails.cvv}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setCardDetails({ ...cardDetails, cvv: val });
                                        }}
                                        placeholder="123"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'COD' && (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-xs font-semibold text-green-800">Cash on Delivery selected. Please pay upon delivery.</p>
                        </div>
                    )}
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
                        <span className="text-white/90 text-sm font-medium">
                            {paymentMethod === 'COD' ? 'Place COD Order' : 'Pay & Order'}
                        </span>
                        <span className="flex items-center gap-2 text-base">
                            {loading ? 'Processing...' : `₹${total}`}
                            {!loading && <ArrowRight className="h-5 w-5" />}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderReviewPage;
