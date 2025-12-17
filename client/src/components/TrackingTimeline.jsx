import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTruck, FaBox, FaClipboardList, FaHome } from 'react-icons/fa';

const statusIcons = {
    'Ordered': FaClipboardList,
    'Packed': FaBox,
    'Shipped': FaTruck,
    'Out for Delivery': FaTruck,
    'Delivered': FaHome, // Or FaCheckCircle
};

const TrackingTimeline = ({ history }) => {
    if (!history || history.length === 0) return null;

    // detailed reverse chronological order
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="relative border-l-2 border-gray-700 ml-4 md:ml-6 mt-8 space-y-8">
            {sortedHistory.map((event, index) => {
                const Icon = statusIcons[event.status] || FaCheckCircle;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="mb-8 ml-6"
                    >
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full -left-4 ring-4 ring-gray-900">
                            <Icon className="text-white text-sm" />
                        </span>
                        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-white">
                                {event.status}
                                {index === 0 && (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
                                        Latest
                                    </span>
                                )}
                            </h3>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                                {new Date(event.timestamp).toLocaleString()}
                            </time>
                            <p className="mb-4 text-base font-normal text-gray-300">
                                {event.location ? `Location: ${event.location}` : 'Processing...'}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default TrackingTimeline;
