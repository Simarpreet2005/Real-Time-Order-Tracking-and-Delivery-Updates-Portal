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

const defaultCenter = { lat: 28.6139, lng: 77.209 };

function AdminPortal() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const loadData = async () => {
    const [ordersRes, agentsRes] = await Promise.all([
      axios.get(`${API_BASE}/api/admin/orders`),
      axios.get(`${API_BASE}/api/admin/agents`),
    ]);
    setOrders(ordersRes.data);
    setAgents(agentsRes.data);
  };

  useEffect(() => {
    loadData();

    const onOrderUpdated = (order) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? order : o))
      );
      setSelectedOrder((prev) =>
        prev && prev._id === order._id ? order : prev
      );
    };
    const onAgentUpdated = (agent) => {
      setAgents((prev) =>
        prev.map((a) => (a._id === agent._id ? agent : a))
      );
    };

    socket.on('order:updated', onOrderUpdated);
    socket.on('agent:updated', onAgentUpdated);

    return () => {
      socket.off('order:updated', onOrderUpdated);
      socket.off('agent:updated', onAgentUpdated);
    };
  }, []);

  const handleAssign = async (agentId) => {
    if (!selectedOrder) return;
    const res = await axios.post(
      `${API_BASE}/api/admin/orders/${selectedOrder._id}/assign`,
      { agentId }
    );
    setSelectedOrder(res.data);
    await loadData();
  };

  const handleStatusChange = async (status) => {
    if (!selectedOrder) return;
    const res = await axios.post(
      `${API_BASE}/api/admin/orders/${selectedOrder._id}/status`,
      { status }
    );
    setSelectedOrder(res.data);
    await loadData();
  };

  const activeAgents = agents.filter((a) => a.isOnline && !a.isBlocked);

  return (
    <div className="portal">
      <h2>Admin Dashboard</h2>
      <div className="layout">
        <div className="left-pane">
          <div className="card">
            <h3>Orders</h3>
            <ul className="list">
              {orders.map((o) => (
                <li
                  key={o._id}
                  onClick={() => setSelectedOrder(o)}
                  className={
                    selectedOrder?._id === o._id ? 'list-item active' : 'list-item'
                  }
                >
                  <div>
                    <strong>{o.status}</strong>
                    <div className="small">
                      User: {o.userId} • Agent:{' '}
                      {o.agentId ? o.agentId : 'Unassigned'}
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
            <h3>Details & Control</h3>
            {selectedOrder ? (
              <>
                <p>
                  Order #{selectedOrder._id.slice(-6)} – Status:{' '}
                  {selectedOrder.status}
                </p>
                <p>User: {selectedOrder.userId}</p>
                <p>Agent: {selectedOrder.agentId || 'Unassigned'}</p>

                <h4>Assign Agent</h4>
                <div className="chips">
                  {activeAgents.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => handleAssign(a._id)}
                      className="chip"
                    >
                      {a.name || a.phone}
                    </button>
                  ))}
                  {activeAgents.length === 0 && (
                    <p className="small">No active agents online.</p>
                  )}
                </div>

                <h4>Change Status</h4>
                <div className="chips">
                  {[
                    'PLACED',
                    'ASSIGNED',
                    'ACCEPTED',
                    'PACKING',
                    'OUT_FOR_DELIVERY',
                    'DELIVERED',
                    'CANCELLED',
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className="chip"
                    >
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                {isLoaded && (
                  <>
                    <h4>Live Map</h4>
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={
                        selectedOrder.currentLocation ||
                        selectedOrder.pickupLocation ||
                        defaultCenter
                      }
                      zoom={13}
                    >
                      {selectedOrder.currentLocation && (
                        <Marker position={selectedOrder.currentLocation} />
                      )}
                    </GoogleMap>
                  </>
                )}
              </>
            ) : (
              <p>Select an order to manage.</p>
            )}
          </div>

          <div className="card">
            <h3>Agents</h3>
            <ul className="list small-list">
              {agents.map((a) => (
                <li key={a._id} className="list-item">
                  <div>
                    <strong>{a.name || a.phone}</strong>
                    <div className="small">
                      {a.isOnline ? 'Online' : 'Offline'}{' '}
                      {a.isBlocked ? '(Blocked)' : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;


