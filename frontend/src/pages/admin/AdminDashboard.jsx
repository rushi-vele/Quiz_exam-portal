import React, { useState, useEffect } from 'react';
import { 
    Users, 
    BookOpen, 
    CheckCircle2, 
    Clock, 
    PlusCircle,
    TrendingUp,
    Filter,
    HelpCircle,
    ArrowUpRight,
    RotateCcw
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { Card, Button } from '../../components/common';
import API from '../../api/api';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

import { useNavigate } from 'react-router-dom';

const KPICard = ({ title, value, icon: Icon, trend, color, onClick }) => (
    <Card className={cn("relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all", onClick && "active:scale-95")} onClick={onClick}>
        <div className={cn(
            "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-500",
            color || "bg-primary-600"
        )}></div>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
                <div className="flex items-center gap-1.5 mt-4">
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ArrowUpRight size={12} strokeWidth={3} /> {trend}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">vs last month</span>
                </div>
            </div>
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 group-hover:scale-110",
                color ? `bg-${color.split('-')[1]}-50 text-${color.split('-')[1]}-600` : "bg-primary-50 text-primary-600"
            )}>
                <Icon size={24} />
            </div>
        </div>
    </Card>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        exams: 0,
        questions: 0,
        submissions: 0,
        pendingRetakes: 0,
        avgScore: 0,
        activityTrend: [],
        topPerformers: [],
        recentSubmissions: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get('/analytics/dashboard');
                setStats(res.data);
            } catch (err) {
                toast.error('Failed to load system metrics');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = stats.activityTrend.length > 0 ? stats.activityTrend.map(t => ({
        name: t.date,
        count: t.count
    })) : [
        { name: 'Mon', count: 0 },
        { name: 'Tue', count: 0 },
        { name: 'Wed', count: 0 },
        { name: 'Thu', count: 0 },
        { name: 'Fri', count: 0 },
        { name: 'Sat', count: 0 },
        { name: 'Sun', count: 0 },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">System Overview</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time performance metrics and platform health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="md">
                        <Filter size={18} /> Filters
                    </Button>
                    <Button variant="primary" size="md">
                        <TrendingUp size={18} /> Export Analytics
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Platform Cohort" value={stats.students} icon={Users} trend="12" />
                <KPICard title="Assessment Base" value={stats.exams} icon={BookOpen} trend="8" color="bg-indigo-600" />
                <KPICard title="Question Inventory" value={stats.questions} icon={HelpCircle} trend="15" color="bg-purple-600" />
                <KPICard 
                    title="Needs Review" 
                    value={stats.pendingRetakes} 
                    icon={RotateCcw} 
                    trend={stats.pendingRetakes > 0 ? "Alert" : "Clean"} 
                    color="bg-amber-600" 
                    onClick={() => navigate('/admin/retakes')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Activity Analytics" subtitle="Student submissions over the last 7 days" className="lg:col-span-2">
                    <div className="h-[350px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#4F46E5" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Performers" subtitle="Highest average percentages" action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/students')}>View All</Button>}>
                    <div className="space-y-6 mt-4">
                        {stats.topPerformers.length > 0 ? stats.topPerformers.map((student, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-700">{student.name}</span>
                                    <span className="text-slate-900">{student.score}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000", 
                                            i === 0 ? "bg-primary-600" : i === 1 ? "bg-indigo-600" : i === 2 ? "bg-emerald-600" : "bg-amber-600"
                                        )}
                                        style={{ width: `${student.score}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center py-10">No data available yet.</p>
                        )}
                    </div>
                </Card>
            </div>

            <Card title="Recent Submissions" action={<Button variant="ghost" size="sm">View All</Button>}>
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Title</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.recentSubmissions.length > 0 ? stats.recentSubmissions.map((sub, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                                                {sub.student_name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{sub.student_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{sub.exam_title}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-xs font-bold",
                                            (sub.score / sub.total_marks) >= 0.4 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                        )}>
                                            {sub.score}/{sub.total_marks}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                        {new Date(sub.end_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            (sub.score / sub.total_marks) >= 0.4 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                        )}>
                                            {(sub.score / sub.total_marks) >= 0.4 ? 'Success' : 'Fail'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        No recent submissions.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
