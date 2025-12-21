import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';
const socket = io(API_BASE, { transports: ['websocket'] });

function AgentPortal() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [agent, setAgent] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    if (!agent) return;
    socket.emit('agent:register', agent._id);

    const onAssigned = (order) => {
      if (order.agentId === agent._id) {
        setAssignedOrders((prev) => [order, ...prev]);
        setActiveOrder(order);
      }
    };

    socket.on('order:assigned', onAssigned);
    return () => {
      socket.off('order:assigned', onAssigned);
    };
  }, [agent]);

  const handleLogin = async () => {
    if (!phone.trim()) return;
    const res = await axios.post(`${API_BASE}/api/agent/login`, {
      phone,
      name,
    });
    setAgent(res.data);
    setIsOnline(res.data.isOnline);
  };

  const toggleOnline = async () => {
    if (!agent) return;
    const res = await axios.post(
      `${API_BASE}/api/agent/${agent._id}/online`,
      { isOnline: !isOnline }
    );
    setIsOnline(res.data.isOnline);
  };

  // Simple demo: simulate movement around pickup->drop every 3s
  const startDemoLocationStream = () => {
    if (!activeOrder || !agent) return;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      const from = activeOrder.pickupLocation || activeOrder.dropLocation;
      const to = activeOrder.dropLocation || activeOrder.pickupLocation;
      const lat = from.lat + (to.lat - from.lat) * Math.min(t, 1);
      const lng = from.lng + (to.lng - from.lng) * Math.min(t, 1);

      socket.emit('agent:location', {
        orderId: activeOrder._id,
        agentId: agent._id,
        lat,
        lng,
        timestamp: Date.now(),
      });

      if (t >= 1) {
        clearInterval(interval);
        socket.emit('agent:status', {
          orderId: activeOrder._id,
          status: 'DELIVERED',
        });
      }
    }, 3000);
  };

  return (
    <div className="portal">
      <h2>Delivery Agent Portal</h2>
      {!agent ? (
        <div className="card">
          <h3>Login</h3>
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleLogin}>Continue</button>
        </div>
      ) : (
        <>
          <div className="card">
            <h3>
              {agent.name} ({agent.phone})
            </h3>
            <button onClick={toggleOnline}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          <div className="layout">
            <div className="left-pane">
              <div className="card">
                <h3>Assigned Orders</h3>
                {assignedOrders.length === 0 && <p>No orders yet.</p>}
                <ul className="list">
                  {assignedOrders.map((o) => (
                    <li
                      key={o._id}
                      onClick={() => setActiveOrder(o)}
                      className={
                        activeOrder?._id === o._id ? 'list-item active' : 'list-item'
                      }
                    >
                      <div>
                        <strong>{o.status}</strong>
                      </div>
                      <div className="small">#{o._id.slice(-6)}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="right-pane">
              <div className="card">
                <h3>Actions</h3>
                {activeOrder ? (
                  <>
                    <p>
                      Order #{activeOrder._id.slice(-6)} – Status:{' '}
                      {activeOrder.status}
                    </p>
                    <button onClick={startDemoLocationStream}>
                      Start Delivery Simulation
                    </button>
                  </>
                ) : (
                  <p>Select an order to act on.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AgentPortal;


