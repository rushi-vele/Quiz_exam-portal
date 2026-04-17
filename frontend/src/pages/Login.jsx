import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await login(credentials.email, credentials.password);
            toast.success(`Welcome back, ${data.user.name}!`);
            navigate(data.user.role === 'admin' ? '/admin' : '/student');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left Side: Illustration & Branding */}
            <div className="hidden lg:flex bg-[#0F172A] p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/30">
                        <GraduationCap size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight leading-none">QuizMaster</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Next-Gen Learning</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-5xl font-black text-white tracking-tighter leading-[1.1] mb-6">
                        Empowering the <span className="text-primary-400">future</span> of digital examinations.
                    </h2>
                    <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
                        Join thousands of students and educators in the world's most advanced online assessment platform.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-8">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Trusted by 50+ Universities</p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex items-center justify-center p-8 lg:p-24 relative">
                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                            <ShieldCheck size={14} /> Secure Access Control
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">System Login</h2>
                        <p className="text-slate-500 font-medium">Please enter your institutional credentials.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    required
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                                    placeholder="name@university.edu" 
                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-xs font-bold text-primary-600 hover:text-primary-700">Forgot Password?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input 
                                    type="password" 
                                    required
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
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
                            Sign In to Portal <ArrowRight size={18} />
                        </Button>

                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Don't have an account? {' '}
                                <button 
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
                                >
                                    Register Now
                                </button>
                            </p>
                        </div>
                    </form>

                    <div className="pt-10 border-t border-slate-100 flex flex-col items-center gap-6">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Official Support</p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 cursor-not-allowed border-2 border-transparent transition-all">
                                <LogIn size={20} />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 cursor-pointer border-2 border-primary-100 hover:bg-primary-100 transition-all">
                                <GraduationCap size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
