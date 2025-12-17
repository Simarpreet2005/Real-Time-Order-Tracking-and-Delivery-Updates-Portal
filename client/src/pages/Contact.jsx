import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-12 shadow-xl">
                <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-black p-3 rounded-full text-white">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-semibold">support@swiftdrop.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-black p-3 rounded-full text-white">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-semibold">+1 (555) 123-4567</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-black p-3 rounded-full text-white">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Office</p>
                                <p className="font-semibold">123 Innovation Dr, Tech City</p>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-4">
                        <input type="text" placeholder="Your Name" className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-black transition-all" />
                        <input type="email" placeholder="Your Email" className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-black transition-all" />
                        <textarea placeholder="Message" rows="4" className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-black transition-all"></textarea>
                        <button className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
