import React from 'react';

const About = () => {
    return (
        <div className="min-h-screen bg-white py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6">About SwiftDrop</h1>
                <p className="text-xl text-gray-600 mb-12">
                    We are revolutionizing the way you shop for daily essentials. SwiftDrop ensures that you get what you need, when you need it, in minutes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p className="text-gray-600">To provide the fastest, most reliable delivery service in the city, empowering local businesses and delighting customers.</p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                        <p className="text-gray-600">To be the default delivery partner for every household, ensuring no one has to wait for hours for their basic needs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
