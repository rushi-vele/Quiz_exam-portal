import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search exams, students, results..." 
                        className="w-full bg-slate-100/50 border-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <NotificationBell />

                <div className="h-8 w-px bg-slate-200"></div>

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 capitalize">{user?.role || 'Role'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 group-hover:border-primary-200 group-hover:bg-primary-50 transition-all">
                        <User size={20} />
                    </div>
                    <ChevronDown size={16} className="text-slate-400 group-hover:text-primary-500 transition-transform group-hover:translate-y-0.5" />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
