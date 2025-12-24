import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-2 rounded-lg">
                                <span className="text-white font-bold text-lg">dr</span>
                            </div>
                            <span className="font-bold text-2xl text-slate-900">delivery reimagined</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Experience the future of delivery. Superfast delivery, premium products, and exceptional service right at your doorstep.
                        </p>
                        <div className="flex gap-4 pt-2">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            {['About Us', 'Partner with us', 'Ride with us', 'Careers', 'Blog'].map(item => (
                                <li key={item}>
                                    <Link to="#" className="hover:text-primary transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Support</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            {['Help Center', 'Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Security'].map(item => (
                                <li key={item}>
                                    <Link to="#" className="hover:text-primary transition-colors">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Download App */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Get the App</h4>
                        <div className="space-y-4">
                            <button className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors">
                                <span className="font-bold text-sm">Download on App Store</span>
                            </button>
                            <button className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors">
                                <span className="font-bold text-sm">Get it on Google Play</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-400">© 2025 BlinkVibe Technologies Pvt. Ltd.</p>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>in India</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
