import React from 'react';
import { motion } from 'framer-motion';

const StatusCard = ({ status, estimatedDelivery }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl mb-6 relative overflow-hidden"
        >
            <div className="relative z-10">
                <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Current Status</h2>
                <h1 className="text-4xl font-bold text-white mb-4 transparent-text bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {status}
                </h1>
                {estimatedDelivery && (
                    <p className="text-gray-300">
                        Estimated Delivery: <span className="text-white font-semibold">{estimatedDelivery}</span>
                    </p>
                )}
            </div>

            {/* Decorative background glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl p-10"></div>
        </motion.div>
    );
};

export default StatusCard;
