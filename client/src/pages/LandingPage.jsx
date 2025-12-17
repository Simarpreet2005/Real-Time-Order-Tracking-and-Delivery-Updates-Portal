import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';

const LandingPage = () => {
    const [trackingId, setTrackingId] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (trackingId.trim()) {
            navigate(`/track/${trackingId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl shadow-2xl"
            >
                <h1 className="text-3xl font-bold text-center mb-2 text-white">Track Your Order</h1>
                <p className="text-gray-400 text-center mb-8">Enter your tracking ID to see real-time updates.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="e.g., TRK-123456789"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 transition-all placeholder-gray-600"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/25"
                    >
                        Track Order
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/admin" className="text-xs text-gray-600 hover:text-gray-400">Carrier Login</a>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
