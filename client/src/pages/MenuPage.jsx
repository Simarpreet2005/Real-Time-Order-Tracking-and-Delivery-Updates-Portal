import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const products = [
    { id: 1, name: 'Amul Taaza Fresh Milk', weight: '500 ml', price: 27, originalPrice: 30, image: 'https://www.bigbasket.com/media/uploads/p/l/306926_4-amul-homogenised-toned-milk.jpg', discount: 10 },
    { id: 2, name: 'Lays India\'s Magic Masala', weight: '50g', price: 20, image: 'https://www.bigbasket.com/media/uploads/p/l/104975_16-lays-potato-chips-indias-magic-masala.jpg' },
    { id: 3, name: 'Coca-Cola Soft Drink', weight: '750 ml', price: 40, originalPrice: 45, image: 'https://www.bigbasket.com/media/uploads/p/l/251006_11-coca-cola-soft-drink.jpg', discount: 11 },
    { id: 4, name: 'Fortune Sun Lite Oil', weight: '1 L', price: 145, originalPrice: 170, image: 'https://www.bigbasket.com/media/uploads/p/l/274145_14-fortune-sun-lite-sunflower-refined-oil.jpg', discount: 15 },
    { id: 5, name: 'Aashirvaad Atta', weight: '5 kg', price: 240, originalPrice: 280, image: 'https://www.bigbasket.com/media/uploads/p/l/126903_8-aashirvaad-atta-whole-wheat.jpg', discount: 14 },
    { id: 6, name: 'Tata Salt Vacuum', weight: '1 kg', price: 28, image: 'https://www.bigbasket.com/media/uploads/p/l/241600_5-tata-salt-iodized.jpg' },
    { id: 7, name: 'Onion - Medium', weight: '1 kg', price: 35, originalPrice: 50, image: 'https://www.bigbasket.com/media/uploads/p/l/10000148_30-fresho-onion-medium.jpg', discount: 30 },
    { id: 8, name: 'Potato', weight: '1 kg', price: 40, originalPrice: 45, image: 'https://www.bigbasket.com/media/uploads/p/l/10000159_25-fresho-potato.jpg' },
];

const MenuPage = ({ cart, addToCart }) => {
    const navigate = useNavigate();
    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white shadow-sm sticky top-20 z-30 border-b border-slate-100 py-4">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm md:text-base">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-slate-700" />
                        </button>
                        <h1 className="font-bold text-slate-900 text-lg">All Products</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} onAdd={addToCart} />
                    ))}
                    {/* Duplicate for demo density */}
                    {products.map(product => (
                        <ProductCard key={`d-${product.id}`} product={product} onAdd={addToCart} />
                    ))}
                </div>
            </div>

            {cartItemCount > 0 && (
                <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={() => navigate('/review')}
                            className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-between shadow-lg shadow-green-900/20 hover:-translate-y-1 transition-all"
                        >
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-xs font-medium opacity-90">{cartItemCount} items</span>
                                <span className="text-lg">View Cart</span>
                            </div>
                            <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg text-sm">
                                Checkout <ShoppingBag className="h-4 w-4" />
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuPage;
