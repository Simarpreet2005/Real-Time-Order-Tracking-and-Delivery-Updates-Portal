import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, MapPin, Plus, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

const AdminPage = ({ onLogout }) => {
    const [orders, setOrders] = useState([]);
    const [riders, setRiders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newOrder, setNewOrder] = useState({
        trackingId: '',
        customerName: '',
        address: ''
    });
    const [newProduct, setNewProduct] = useState({ name: '', price: '', weight: '', image: '' });

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders');
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRiders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users/riders');
            setRiders(res.data);
        } catch (err) {
            console.error(err);
        }
    };



    // ... inside AdminPage ...
    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.emit('joinAdminRoom');

        socket.on('orderUpdated', (updatedOrder) => {
            setOrders(prev => prev.map(o => o.trackingId === updatedOrder.trackingId ? updatedOrder : o));
            if (selectedOrder && selectedOrder.trackingId === updatedOrder.trackingId) {
                setSelectedOrder(updatedOrder);
            }
        });

        fetchOrders();
        fetchRiders();

        return () => socket.disconnect();
    }, []);

    const assignRider = async (riderId) => {
        if (!selectedOrder) return;
        try {
            await axios.put(`http://localhost:5000/api/orders/${selectedOrder.trackingId}/assign`, { riderId });
            fetchOrders();
            alert('Rider Assigned!');
        } catch (err) {
            console.error(err);
            alert('Assignment failed');
        }
    };

    const createOrder = async (e) => {
        e.preventDefault();
        try {
            const orderData = {
                trackingId: newOrder.trackingId || `ORD-${Date.now()}`,
                customer: {
                    name: newOrder.customerName,
                    address: newOrder.address
                },
                initialLocation: { lat: 28.6139, lng: 77.2090, address: 'Warehouse, New Delhi' }
            };

            await axios.post('http://localhost:5000/api/orders', orderData);
            setNewOrder({ trackingId: '', customerName: '', address: '' });
            fetchOrders();
            alert('Order Created!');
        } catch (err) {
            console.error(err);
            alert('Failed to create order');
        }
    };

    const createProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/products', newProduct);
            setNewProduct({ name: '', price: '', weight: '', image: '' });
            alert('Product Added!');
        } catch (err) {
            console.error(err);
            alert('Failed to add product');
        }
    };

    const updateStatus = async (status) => {
        if (!selectedOrder) return;
        try {
            await axios.put(`http://localhost:5000/api/orders/${selectedOrder.trackingId}/status`, { status });
            // Update local state
            const updated = { ...selectedOrder, status };
            setSelectedOrder(updated);
            setOrders(orders.map(o => o.trackingId === updated.trackingId ? updated : o));
        } catch (err) {
            console.error(err);
        }
    };

    const verifyPayment = async () => {
        if (!selectedOrder) return;
        try {
            const res = await axios.put(`http://localhost:5000/api/orders/${selectedOrder.trackingId}/payment`, { status: 'Success' });
            const updated = res.data;
            setSelectedOrder(updated);
            setOrders(orders.map(o => o.trackingId === updated.trackingId ? updated : o));
            alert('Payment Verified!');
        } catch (err) {
            console.error(err);
            alert('Verification failed');
        }
    };



    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={onLogout}
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Order Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm h-fit space-y-8">
                    {/* New Order Form */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5" /> New Order
                        </h2>
                        <form onSubmit={createOrder} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="w-full p-3 border rounded-lg"
                                value={newOrder.customerName}
                                onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Delivery Address"
                                className="w-full p-3 border rounded-lg"
                                value={newOrder.address}
                                onChange={e => setNewOrder({ ...newOrder, address: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Tracking ID (Optional)"
                                className="w-full p-3 border rounded-lg"
                                value={newOrder.trackingId}
                                onChange={e => setNewOrder({ ...newOrder, trackingId: e.target.value })}
                            />
                            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold">
                                Create Order
                            </button>
                        </form>
                    </div>

                    {/* Add Product Form */}
                    <div className="pt-8 border-t">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5" /> Add New Item
                        </h2>
                        <form onSubmit={createProduct} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Product Name"
                                className="w-full p-3 border rounded-lg"
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Price (₹)"
                                    className="w-full p-3 border rounded-lg"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Weight (e.g. 500g)"
                                    className="w-full p-3 border rounded-lg"
                                    value={newProduct.weight}
                                    onChange={e => setNewProduct({ ...newProduct, weight: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Image Link"
                                className="w-full p-3 border rounded-lg"
                                value={newProduct.image}
                                onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                required
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                                Add Item
                            </button>
                        </form>
                    </div>
                </div>

                {/* Order List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm h-[600px] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5" /> Recent Orders
                    </h2>
                    <div className="space-y-3">
                        {loading ? <p>Loading...</p> : orders.map(order => (
                            <div
                                key={order.trackingId}
                                onClick={() => setSelectedOrder(order)}
                                className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedOrder?.trackingId === order.trackingId ? 'border-black bg-gray-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold">#{order.trackingId}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">{order.customer?.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Control Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Truck className="h-5 w-5" /> Rider Controls
                    </h2>
                    {selectedOrder ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Selected Order</p>
                                <p className="font-bold text-lg">#{selectedOrder.trackingId}</p>
                                <div className="mt-2 text-sm">
                                    <p><strong>Customer:</strong> {selectedOrder.customer?.name}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}</p>
                                    <p><strong>Address:</strong> {selectedOrder.customer?.address}</p>
                                    <hr className="my-2" />
                                    <p>
                                        <strong>Payment:</strong> <span className="font-mono">{selectedOrder.paymentMethod || 'COD'}</span>
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <strong>Status:</strong>
                                        <span className={`text-xs px-2 py-1 rounded-full ${selectedOrder.paymentStatus === 'Success' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {selectedOrder.paymentStatus || 'Pending'}
                                        </span>
                                        {selectedOrder.paymentMethod !== 'COD' && selectedOrder.paymentStatus !== 'Success' && (
                                            <button
                                                onClick={verifyPayment}
                                                className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Assign Delivery Partner</p>
                                {selectedOrder.paymentMethod !== 'COD' && selectedOrder.paymentStatus !== 'Success' ? (
                                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Payment verification required before assignment.</span>
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            className="w-full p-3 border rounded-lg bg-white"
                                            onChange={(e) => assignRider(e.target.value)}
                                            value={selectedOrder.deliveryPersonId?._id || ""}
                                        >
                                            <option value="">Select Rider</option>
                                            {riders.map(r => (
                                                <option key={r._id} value={r._id}>{r.name} ({r.email})</option>
                                            ))}
                                        </select>
                                        {selectedOrder.deliveryPersonId && (
                                            <p className="text-xs text-green-600 font-bold mt-1">
                                                Assigned to: {selectedOrder.deliveryPersonId.name}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Update Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Ordered', 'Packed', 'Shipped'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => updateStatus(status)}
                                            className={`py-2 text-sm rounded-lg border ${selectedOrder.status === status ? 'bg-black text-white border-black' : 'hover:bg-gray-100'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>


                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-12">
                            Select an order to manage
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
