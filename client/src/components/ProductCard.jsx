import React from 'react';
import { Plus, Clock } from 'lucide-react';

const ProductCard = ({ product, onAdd }) => {
    return (
        <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-[180px] flex-shrink-0 cursor-pointer overflow-hidden">
            {/* Image Area */}
            <div className="h-32 w-full bg-slate-50 relative flex items-center justify-center p-4">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-auto object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />

                {/* Time Badge */}
                <div className="absolute top-2 left-2 bg-slate-900/5 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-700" />
                    <span className="text-[10px] font-bold text-slate-700">8 mins</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="font-bold text-slate-800 text-sm truncate mb-0.5">{product.name}</h3>
                <p className="text-slate-500 text-xs mb-3">{product.weight}</p>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900">₹{product.price}</span>
                        {product.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                        )}
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                        className="w-16 h-8 rounded-lg bg-green-50 text-green-600 border border-green-200 font-bold text-xs hover:bg-green-600 hover:text-white transition-all flex items-center justify-center"
                    >
                        ADD
                    </button>
                </div>
            </div>

            {/* Discount Badge */}
            {product.discount && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl z-10">
                    {product.discount}% OFF
                </div>
            )}
        </div>
    );
};

export default ProductCard;
