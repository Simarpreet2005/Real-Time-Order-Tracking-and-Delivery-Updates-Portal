import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import UserPortal from './pages/UserPortal';
import AgentPortal from './pages/AgentPortal';
import AdminPortal from './pages/AdminPortal';

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">Real-Time Delivery</div>
        <nav className="nav-links">
          <Link to="/">Customer</Link>
          <Link to="/agent">Delivery Agent</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<UserPortal />} />
          <Route path="/agent" element={<AgentPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
