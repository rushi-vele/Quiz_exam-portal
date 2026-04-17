import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { cn } from '../../utils/cn';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 px-10 flex items-center justify-between shadow-sm">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search assessments, records, or logic..." 
                        className="w-full bg-slate-100/60 border-2 border-transparent focus:border-primary-500/20 focus:bg-white focus:ring-4 focus:ring-primary-500/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest transition-all outline-none placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-8">
                <NotificationBell />

                <div className="h-10 w-px bg-slate-100"></div>

                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-4 pl-2 group transition-all"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-black text-slate-900 tracking-tight leading-none">{user?.name || 'Authorized Personnel'}</p>
                            <p className="text-[10px] font-black text-primary-600 mt-1.5 uppercase tracking-widest flex items-center justify-end gap-1.5">
                                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></span>
                                {user?.role || 'Awaiting Sync'}
                            </p>
                        </div>
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-slate-600 border-2 border-slate-100 transition-all group-hover:border-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/10",
                            isOpen ? "border-primary-500 bg-primary-50 scale-105" : "bg-white"
                        )}>
                            <User size={22} className={cn(isOpen && "text-primary-600")} />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-3xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="p-4 bg-slate-50 rounded-2xl mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated ID</p>
                                <p className="text-xs font-bold text-slate-800 break-all">{user?.email}</p>
                            </div>
                            
                            <div className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all text-sm font-bold group">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <GraduationCap size={16} />
                                    </div>
                                    View Portfolio
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all text-sm font-bold group">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Bell size={16} />
                                    </div>
                                    Alert Settings
                                </button>
                                <div className="h-px bg-slate-100 my-2 mx-4"></div>
                                <button 
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-bold group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <LogOut size={16} />
                                    </div>
                                    Deauthorize & Exit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
