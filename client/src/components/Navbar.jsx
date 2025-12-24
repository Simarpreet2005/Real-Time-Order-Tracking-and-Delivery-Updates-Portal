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

        const handleStorageChange = () => {
            setAddress(localStorage.getItem('deliveryAddress') || "Detecting location...");
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Fetch user addresses if logged in
    React.useEffect(() => {
        if (user && user._id) {
            fetch(`http://localhost:5000/api/auth/${user._id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.addresses) {
                        // We could store this in local state or just use it in the modal
                        // For now, we'll fetch it when modal opens or keep it in a state
                    }
                })
                .catch(err => console.error("Failed to fetch user addresses for navbar", err));
        }
    }, [user]);

    const [savedAddresses, setSavedAddresses] = useState([]);

    React.useEffect(() => {
        if (showLocationModal && user && user._id) {
            fetch(`http://localhost:5000/api/auth/${user._id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.addresses) {
                        setSavedAddresses(data.addresses);
                    }
                })
                .catch(err => console.error("Failed to fetch addresses in modal", err));
        }
    }, [showLocationModal, user]);

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
                                    <span className="text-white font-bold text-xl tracking-tighter">dr</span>
                                </div>
                                <div className="hidden md:block">
                                    <h1 className="font-bold text-2xl tracking-tight text-primary leading-none">delivery reimagined</h1>
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

                        {/* Search Bar - Center (Removed) */}
                        <div className="hidden md:flex flex-1 max-w-2xl px-8">
                            {/* Search Removed */}
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
                                        <Link to="/my-orders" className="text-xs font-bold text-slate-700 hover:text-primary">
                                            Orders
                                        </Link>
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

                            {savedAddresses.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Addresses</p>
                                    {savedAddresses.map((addr, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                updateAddress(`${addr.label} (${addr.plusCode})`);
                                                setShowLocationModal(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <span className="block font-bold text-sm text-slate-900">{addr.label}</span>
                                                <span className="block text-xs text-slate-500 font-mono">{addr.plusCode}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

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
