import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    BookOpen, 
    Users, 
    BarChart3, 
    Trophy, 
    Settings, 
    LogOut,
    GraduationCap,
    RotateCcw
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            isActive 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
        )}
    >
        <Icon size={20} className={cn("transition-transform group-hover:scale-110")} />
        <span className="font-medium">{label}</span>
    </NavLink>
);

const Sidebar = () => {
    const { isAdmin, logout } = useAuth();

    const menuItems = isAdmin ? [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/exams', icon: BookOpen, label: 'Exams' },
        { to: '/admin/students', icon: Users, label: 'Students' },
        { to: '/admin/results', icon: BarChart3, label: 'Results' },
        { to: '/admin/retakes', icon: RotateCcw, label: 'Retakes' },
        { to: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ] : [
        { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/student/exams', icon: BookOpen, label: 'All Exams' },
        { to: '/student/results', icon: BarChart3, label: 'History' },
        { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { to: '/student/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="w-72 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
                    <GraduationCap size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">QuizMaster</h1>
                    <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Enterprise v2.0</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <SidebarItem key={item.to} {...item} />
                ))}
            </nav>

            <div className="pt-6 border-t border-slate-100">
                <button 
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-red-50 hover:text-red-600 w-full"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
