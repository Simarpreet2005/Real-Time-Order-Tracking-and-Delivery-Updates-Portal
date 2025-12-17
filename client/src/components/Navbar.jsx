import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MapPin, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = ({ cartCount = 0 }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    return (
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
                            <h3 className="font-bold text-sm text-slate-900 leading-none mb-1">Delivery in 8 Mins</h3>
                            <div className="flex items-center gap-1 text-slate-500 hover:text-primary cursor-pointer transition-colors group">
                                <span className="text-xs font-medium truncate max-w-[150px]">Home - 123, Green Street...</span>
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
                            {token ? (
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-semibold text-slate-600 hover:text-red-500 transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link to="/auth" className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors">
                                    Login
                                </Link>
                            )}
                        </div>

                        <Link
                            to="/review"
                            className="flex items-center gap-3 bg-secondary hover:bg-secondary-600 text-white px-5 py-3 rounded-xl transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:-translate-y-0.5 active:scale-95"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <div className="flexflex-col items-start leading-none">
                                <span className="font-bold text-sm">My Cart</span>
                                {cartCount > 0 && <span className="text-[10px] opacity-90">{cartCount} items</span>}
                            </div>
                        </Link>
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
    );
};

export default Navbar;
