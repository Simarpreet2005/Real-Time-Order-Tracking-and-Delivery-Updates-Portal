import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const url = `http://localhost:5000${endpoint}`;

            const res = await axios.post(url, formData);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            if (onLogin) onLogin(res.data.user);

            // Redirect based on role
            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'rider') navigate('/rider');
            else navigate('/');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[700px]">

                {/* Visual Side */}
                <div className="md:w-1/2 bg-black text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mb-8">
                            <span className="font-bold text-2xl">dr</span>
                        </div>
                        <h1 className="text-5xl font-bold leading-tight mb-6">
                            Delivery <br />
                            <span className="text-yellow-400">Reimagined.</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Lightning fast deliveries, real-time tracking, and premium service at your fingertips.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex gap-4 mb-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 w-1/2"></div>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-400">Trusted by 1M+ customers</p>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl"></div>
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl"></div>
                </div>

                {/* Form Side */}
                <div className="md:w-1/2 p-12 overflow-y-auto">
                    <div className="max-w-md mx-auto h-full flex flex-col justify-center">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-gray-500">
                                {isLogin ? 'Enter your details to access your account' : 'Join the premium delivery experience'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white"
                                            placeholder="John Doe"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">I am signing up as...</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                                    >
                                        <option value="customer">Hungry Customer</option>
                                        <option value="rider">Delivery Partner</option>
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Sign Up'}
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
