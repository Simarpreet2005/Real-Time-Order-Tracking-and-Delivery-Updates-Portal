import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowRight, ChevronRight, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = ({ addToCart }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);

    const staticBestSellers = [
        { id: 's1', name: 'Amul Taaza Fresh Milk', weight: '500 ml', price: 27, originalPrice: 30, image: 'https://www.bigbasket.com/media/uploads/p/l/306926_4-amul-homogenised-toned-milk.jpg', discount: 10 },
        { id: 's2', name: 'TATA Salt', weight: '1 kg', price: 28, image: '/images/tata-salt.jpg' },
        { id: 's3', name: 'Coca-Cola Soft Drink', weight: '750 ml', price: 40, originalPrice: 45, image: '/images/coca-cola.jpg', discount: 11 },
        { id: 's4', name: 'Britannia White Bread', weight: '400g', price: 45, image: '/images/britannia-bread.jpg' },
        { id: 's5', name: 'Amul Pasteurized Butter', weight: '100g', price: 56, image: '/images/amul-butter.jpg' },
        { id: 's6', name: 'Fortune Sun Lite Oil', weight: '1 L', price: 145, originalPrice: 170, image: '/images/fortune-oil.jpg', discount: 15 },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products');
                setProducts(res.data);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };
        fetchProducts();
    }, []);

    // Mock Data for Visuals
    const categories = [
        { name: 'Vegies', img: 'https://cdn-icons-png.flaticon.com/512/2329/2329903.png', color: 'bg-green-100' },
        { name: 'Fruits', img: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png', color: 'bg-orange-100' },
        { name: 'Dairy', img: 'https://cdn-icons-png.flaticon.com/512/2674/2674486.png', color: 'bg-blue-100' },
        { name: 'Bakery', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081967.png', color: 'bg-yellow-100' },
        { name: 'Snacks', img: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', color: 'bg-purple-100' },
        { name: 'Drinks', img: 'https://cdn-icons-png.flaticon.com/512/2405/2405451.png', color: 'bg-red-100' },
        { name: 'Home', img: 'https://cdn-icons-png.flaticon.com/512/2203/2203183.png', color: 'bg-indigo-100' },
        { name: 'Beauty', img: 'https://cdn-icons-png.flaticon.com/512/2763/2763114.png', color: 'bg-pink-100' },
        { name: 'Meds', img: 'https://cdn-icons-png.flaticon.com/512/883/883356.png', color: 'bg-teal-100' },
        { name: 'Pet', img: 'https://cdn-icons-png.flaticon.com/512/194/194279.png', color: 'bg-gray-100' },
    ];


    const filteredBestSellers = staticBestSellers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredFreshItems = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="pb-20 bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 pt-8 pb-16 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-white space-y-6">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-semibold">Superfast Delivery</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                Groceries delivered in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">8 minutes</span>.
                            </h1>
                            <p className="text-indigo-200 text-lg max-w-lg">
                                Fresh produce, daily essentials, and more. No minimum order, trusted by millions.
                            </p>

                            <div className="relative max-w-md mt-8 group">
                                <input
                                    type="text"
                                    placeholder="Search for items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-4 pl-12 pr-4 rounded-xl bg-white text-gray-900 font-medium focus:ring-4 focus:ring-yellow-400/30 outline-none transition-all shadow-xl"
                                />
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-900" />
                            </div>
                        </div>
                        {/* Hero Image Mockup */}
                        <div className="relative hidden md:block">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-indigo-900/50 z-20"></div>
                            <img
                                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
                                alt="Grocery Bag"
                                className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700 w-full object-cover h-[350px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12">

                {/* Categories */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-x-4 gap-y-6">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className={`w-16 h-16 ${cat.color} rounded-xl flex items-center justify-center group-hover:-translate-y-1 transition-transform`}>
                                    <img src={cat.img} alt={cat.name} className="w-10 h-10 object-contain drop-shadow-sm" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 group-hover:text-primary">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Promotional Banners */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="col-span-1 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white h-48 relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Fresh Fruits</h3>
                            <p className="opacity-90 text-sm mb-4">Up to 40% OFF</p>
                            <button className="bg-white text-rose-600 px-4 py-2 rounded-lg text-xs font-bold">Shop Now</button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                            <img src="https://cdn-icons-png.flaticon.com/512/1625/1625048.png" className="w-32 h-32" alt="" />
                        </div>
                    </div>
                    <div className="col-span-1 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white h-48 relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Daily Needs</h3>
                            <p className="opacity-90 text-sm mb-4">Under ₹99 Store</p>
                            <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold">Shop Now</button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                            <img src="https://cdn-icons-png.flaticon.com/512/2674/2674486.png" className="w-32 h-32" alt="" />
                        </div>
                    </div>
                    <div className="col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white h-48 relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Pharmacy</h3>
                            <p className="opacity-90 text-sm mb-4">Delivery in 10 mins</p>
                            <button className="bg-white text-teal-600 px-4 py-2 rounded-lg text-xs font-bold">Order Meds</button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                            <img src="https://cdn-icons-png.flaticon.com/512/883/883356.png" className="w-32 h-32" alt="" />
                        </div>
                    </div>
                </div>

                {/* Product Feed: Best Sellers */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Best Sellers</h2>
                        <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            See all <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Horizontal Scroll Area */}
                    <div className="flex gap-4 overflow-x-auto pb-8 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {filteredBestSellers.map(product => (
                            <ProductCard key={product.id} product={product} onAdd={addToCart} />
                        ))}
                    </div>
                </section>

                {/* Product Feed: Freshly Added (From DB) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Freshly Added</h2>
                        <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            See all <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-8 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {filteredFreshItems.length > 0 ? (
                            // Reverse to show newest first
                            [...filteredFreshItems].reverse().map(product => (
                                <ProductCard key={product._id || product.id} product={product} onAdd={addToCart} />
                            ))
                        ) : (
                            <div className="py-12 bg-white rounded-2xl w-full text-center border border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium italic">No new items added yet.</p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Home;
