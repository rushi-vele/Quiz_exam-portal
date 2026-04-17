import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Info, Clock, Check } from 'lucide-react';
import API from '../../api/api';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await API.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Periodic update every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read');
        }
    };

    const markAllRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200",
                    isOpen ? "bg-primary-50 text-primary-600" : "text-slate-500 hover:bg-slate-100"
                )}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h4>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllRead}
                                className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest flex items-center gap-1"
                            >
                                <Check size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Bell className="mx-auto text-slate-100 mb-2" size={40} />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No new alerts</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={cn(
                                        "p-4 border-b border-slate-50 last:border-0 transition-colors cursor-pointer group relative",
                                        !n.is_read ? "bg-primary-50/30 hover:bg-primary-50/50" : "hover:bg-slate-50"
                                    )}
                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                >
                                    {!n.is_read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600"></div>
                                    )}
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                            n.type === 'exam_created' ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
                                        )}>
                                            {n.type === 'exam_created' ? <CheckCircle2 size={16} /> : <Info size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("text-xs leading-snug mb-1", !n.is_read ? "font-bold text-slate-900" : "text-slate-600")}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Clock size={10} className="text-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-400">
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                        <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">View All Activity</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
