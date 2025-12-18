import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MapPin, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = ({ cartCount = 0, user, onLogout }) => {
    const navigate = useNavigate();
    const [address, setAddress] = useState(localStorage.getItem('deliveryAddress') || "Detecting location...");
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [manualAddress, setManualAddress] = useState("");

    const updateAddress = (newAddress) => {
        setAddress(newAddress);
        localStorage.setItem('deliveryAddress', newAddress);
    };

    const getLocation = () => {
        if ("geolocation" in navigator) {
            setAddress("Detecting...");
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const parts = data.display_name.split(',').slice(0, 3).join(',');
                    updateAddress(parts);
                    setShowLocationModal(false);
                } catch (err) {
                    console.error("Reverse geocoding failed:", err);
                    updateAddress(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
                    setShowLocationModal(false);
                }
            }, () => {
                updateAddress("New Delhi, India");
                setShowLocationModal(false);
            });
        }
    };

    React.useEffect(() => {
        if (!localStorage.getItem('deliveryAddress')) {
            getLocation();
        }
    }, []);

    const handleManualAddress = (e) => {
        e.preventDefault();
        if (manualAddress.trim()) {
            updateAddress(manualAddress);
            setShowLocationModal(false);
            setManualAddress("");
        }
    };

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
                {/* Top Bar for Location & Branding */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20 gap-4">
                        {/* Brand & Location */}
                        <div className="flex items-center gap-6 min-w-fit">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="bg-primary p-2.5 rounded-xl transition-transform group-hover:scale-105">
                                    <span className="text-white font-bold text-xl tracking-tighter">BV</span>
                                </div>
                                <div className="hidden md:block">
                                    <h1 className="font-bold text-2xl tracking-tight text-primary leading-none">BlinkVibe</h1>
                                    <p className="text-xs text-slate-500 font-medium tracking-wide">PREMIUM DELIVERY</p>
                                </div>
                            </Link>

                            <div className="hidden lg:flex flex-col border-l-2 border-slate-100 pl-6 h-10 justify-center">
                                <h3 className="font-bold text-sm text-slate-900 leading-none mb-1">Delivering to</h3>
                                <div
                                    className="flex items-center gap-1 text-slate-500 hover:text-primary cursor-pointer transition-colors group"
                                    onClick={() => setShowLocationModal(true)}
                                >
                                    <span className="text-xs font-medium truncate max-w-[150px]">{address}</span>
                                    <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Search Bar - Center */}
                        <div className="hidden md:flex flex-1 max-w-2xl px-8">
                            <div className="relative w-full group">
                                <input
                                    type="text"
                                    placeholder="Search for 'milk', 'chips', 'iphone'..."
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm group-hover:shadow-md"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 sm:gap-6 min-w-fit">
                            <div className="hidden sm:flex items-center gap-6">
                                {user ? (
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-slate-400 capitalize font-bold tracking-widest leading-none mb-1">{user.role}</span>
                                            <span className="text-sm font-bold text-slate-900">{user.name}</span>
                                        </div>
                                        <button
                                            onClick={onLogout}
                                            className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <Link to="/auth" className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                                        Login / Sign up
                                    </Link>
                                )}
                            </div>

                            {(!user || user.role === 'customer') && (
                                <Link
                                    to="/review"
                                    className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl transition-all shadow-lg shadow-red-200 hover:-translate-y-0.5 active:scale-95"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="font-bold text-sm text-white">Cart</span>
                                        {cartCount > 0 && <span className="text-[10px] opacity-90 text-white">{cartCount} items</span>}
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search - Below Toolbar */}
                <div className="md:hidden px-4 pb-4">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>
                </div>
            </nav>

            {/* Location Picker Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Change Location</h3>
                            <button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={getLocation}
                                className="w-full flex items-center gap-3 p-4 border border-primary/20 bg-primary/5 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                            >
                                <MapPin className="w-5 h-5" />
                                <div className="text-left">
                                    <span className="block font-bold text-sm">Use Current Location</span>
                                    <span className="block text-xs opacity-70">Using GPS</span>
                                </div>
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Or enter manually</span>
                                </div>
                            </div>

                            <form onSubmit={handleManualAddress}>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter city, area, or pincode..."
                                        className="flex-1 p-3 border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={manualAddress}
                                        onChange={(e) => setManualAddress(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
