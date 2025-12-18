import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, cartCount, user, onLogout }) => {
    const location = useLocation();

    // Auth-first: Don't show Nav if not logged in (unless on Auth page)
    const isAuthPage = location.pathname === '/auth';
    const hasAccess = user && user.role === 'customer';

    // Hide for Admin, Rider, and Auth pages
    const showNavbar = !isAuthPage && hasAccess;
    const showFooter = !isAuthPage && hasAccess;

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            {showNavbar && <Navbar cartCount={cartCount} user={user} onLogout={onLogout} />}
            <main className={`flex-grow ${showNavbar ? 'pt-24' : ''}`}>
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};

export default Layout;
