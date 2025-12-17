import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, cartCount }) => {
    const location = useLocation();
    const hideNavPaths = ['/auth'];
    const hideFooterPaths = ['/auth', '/track', '/admin'];

    const showNavbar = !hideNavPaths.includes(location.pathname);
    const showFooter = !hideFooterPaths.some(path => location.pathname.startsWith(path));

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            {showNavbar && <Navbar cartCount={cartCount} />}
            <main className={`flex-grow ${showNavbar ? 'pt-24' : ''}`}>
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};

export default Layout;
