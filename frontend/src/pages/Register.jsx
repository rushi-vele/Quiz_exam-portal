import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/common';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register`, {
                ...formData,
                role: 'student'
            });
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left Side: Branding */}
            <div className="hidden lg:flex bg-[#0F172A] p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white">
                        <GraduationCap size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white">QuizMaster</h1>
                </div>

                <div className="relative z-10">
                    <h2 className="text-5xl font-black text-white leading-tight mb-6">
                        Join the <span className="text-primary-400">elite</span> circle of learners.
                    </h2>
                    <p className="text-slate-400 text-lg">Create your student account with institutional credentials.</p>
                </div>

                <div className="relative z-10 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    &copy; 2024 QuizMaster Systems
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center justify-center p-8 lg:p-24">
                <div className="w-full max-w-md space-y-10">
                    <div>
                        <button 
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors mb-8"
                        >
                            <ArrowLeft size={16} /> Back to Sign In
                        </button>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 font-medium mt-2">Start your academic journey with us today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="John Doe" 
                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="name@university.edu" 
                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input 
                                    type="password" 
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="••••••••" 
                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            isLoading={isLoading}
                            className="w-full py-4 text-sm shadow-xl shadow-primary-600/20"
                        >
                            Register Academy Account <ArrowRight size={18} />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
