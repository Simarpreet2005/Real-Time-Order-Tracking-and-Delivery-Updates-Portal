import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const API_BASE = 'http://localhost:5000';
const socket = io(API_BASE, { transports: ['websocket'] });

const containerStyle = {
  width: '100%',
  height: '320px',
};

const defaultCenter = { lat: 28.6139, lng: 77.209 }; // Delhi as a demo default

const statusLabels = [
  'PLACED',
  'ASSIGNED',
  'ACCEPTED',
  'PACKING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

function UserPortal() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [pickup, setPickup] = useState(defaultCenter);
  const [drop, setDrop] = useState({ lat: 28.7041, lng: 77.1025 }); // Delhi NCR demo
  const [activeOrder, setActiveOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (!activeOrder) return;
    socket.emit('order:join', activeOrder._id);

    const onLoc = (order) => {
      if (order._id === activeOrder._id) {
        setActiveOrder(order);
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? order : o))
        );
      }
    };
    const onStatus = (order) => {
      if (order._id === activeOrder._id) {
        setActiveOrder(order);
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? order : o))
        );
      }
    };

    socket.on('order:location', onLoc);
    socket.on('order:status', onStatus);

    return () => {
      socket.off('order:location', onLoc);
      socket.off('order:status', onStatus);
    };
  }, [activeOrder]);

  const handleLogin = async () => {
    if (!name.trim()) return;
    const res = await axios.post(`${API_BASE}/api/user/login`, { name });
    setUser(res.data);
    const ordersRes = await axios.get(
      `${API_BASE}/api/orders/user/${res.data.userId}`
    );
    setOrders(ordersRes.data);
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/orders`, {
        userId: user.userId,
        pickupLocation: pickup,
        dropLocation: drop,
      });
      setOrders((prev) => [res.data, ...prev]);
      setActiveOrder(res.data);
    } finally {
      setLoading(false);
    };
  };

  const handleSelectOrder = (order) => {
    setActiveOrder(order);
  };

  const handleCancel = async () => {
    if (!activeOrder) return;
    const res = await axios.post(
      `${API_BASE}/api/orders/${activeOrder._id}/cancel`
    );
    setActiveOrder(res.data);
    setOrders((prev) =>
      prev.map((o) => (o._id === res.data._id ? res.data : o))
    );
  };

  const currentLoc =
    activeOrder?.currentLocation || activeOrder?.pickupLocation || pickup;

  return (
    <div className="portal">
      <h2>Customer Portal</h2>
      {!user ? (
        <div className="card">
          <h3>Login / Sign Up</h3>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleLogin}>Continue</button>
        </div>
      ) : (
        <>
          <div className="card">
            <h3>Welcome, {user.name}</h3>
            <p>User ID (demo): {user.userId}</p>
          </div>

          <div className="layout">
            <div className="left-pane">
              <div className="card">
                <h3>Place Order</h3>
                <p>
                  For demo, pickup/drop are pre-filled coordinates around Delhi.
                </p>
                <button onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Placing...' : 'Place Order'}
                </button>
              </div>

              <div className="card">
                <h3>Your Orders</h3>
                {orders.length === 0 && <p>No orders yet.</p>}
                <ul className="list">
                  {orders.map((o) => (
                    <li
                      key={o._id}
                      onClick={() => handleSelectOrder(o)}
                      className={
                        activeOrder?._id === o._id ? 'list-item active' : 'list-item'
                      }
                    >
                      <div>
                        <strong>{o.status}</strong>
                        <div className="small">
                          ETA: {o.eta ? `${o.eta} min` : '—'}
                        </div>
                      </div>
                      <div className="small">
                        #{o._id.slice(-6)} •{' '}
                        {new Date(o.createdAt).toLocaleTimeString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="right-pane">
              <div className="card">
                <h3>Live Tracking</h3>
                {activeOrder ? (
                  <>
                    <div className="status-row">
                      <span>Status: {activeOrder.status}</span>
                      <span>
                        ETA:{' '}
                        {activeOrder.eta ? `${activeOrder.eta} minutes` : '—'}
                      </span>
                    </div>
                    <div className="status-timeline">
                      {statusLabels.map((s) => (
                        <div
                          key={s}
                          className={
                            'status-step ' +
                            (statusLabels.indexOf(s) <=
                            statusLabels.indexOf(activeOrder.status)
                              ? 'done'
                              : '')
                          }
                        >
                          {s.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                    {isLoaded && (
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={currentLoc || defaultCenter}
                        zoom={13}
                      >
                        {currentLoc && <Marker position={currentLoc} />}
                        {activeOrder.dropLocation && (
                          <Marker
                            position={activeOrder.dropLocation}
                            icon={{
                              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            }}
                          />
                        )}
                      </GoogleMap>
                    )}
                    <button
                      onClick={handleCancel}
                      disabled={
                        ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(
                          activeOrder.status
                        ) || activeOrder.status === 'CANCELLED'
                      }
                    >
                      Cancel Order
                    </button>
                  </>
                ) : (
                  <p>Select an order to track.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserPortal;


