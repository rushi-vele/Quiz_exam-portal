import React from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    Award, 
    PieChart as PieIcon,
    Download,
    Share2,
    Search,
    Filter
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { Card, Button } from '../../components/common';
import { cn } from '../../utils/cn';

const Results = () => {
    const scoreData = [
        { range: '0-20', count: 12 },
        { range: '21-40', count: 45 },
        { range: '41-60', count: 120 },
        { range: '61-80', count: 340 },
        { range: '81-100', count: 210 },
    ];

    const COLORS = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#3B82F6'];

    const performanceData = [
        { name: 'Mon', score: 72 },
        { name: 'Tue', score: 75 },
        { name: 'Wed', score: 68 },
        { name: 'Thu', score: 82 },
        { name: 'Fri', score: 79 },
        { name: 'Sat', score: 85 },
        { name: 'Sun', score: 88 },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Exam Intelligence</h1>
                    <p className="text-slate-500 font-medium mt-1">Deep-dive analysis of student performance across all assessments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline"><Share2 size={18} /> share</Button>
                    <Button variant="primary"><Download size={18} /> Export Data</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Score Distribution" subtitle="Number of students per score range">
                    <div className="h-[350px] mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreData}>
                                <XAxis 
                                    dataKey="range" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                                />
                                <YAxis hide />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#F1F5F9' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {scoreData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Institutional Trends" subtitle="Average scores over the last 7 days">
                    <div className="h-[350px] mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                                />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="score" fill="#4F46E5" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Detailed Performance Ledger" action={
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input className="bg-slate-50 border-none rounded-xl py-1.5 pl-9 pr-3 text-xs font-bold outline-none" placeholder="Search record..." />
                    </div>
                    <Button variant="ghost" size="sm"><Filter size={16} /></Button>
                </div>
            }>
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Portfolio</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw Score</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentile</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Result Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1,2,3,4,5,6].map((_, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">MK</div>
                                            <div>
                                                <h6 className="text-sm font-black text-slate-900 leading-none">Marcus Knight</h6>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">CS-2023-00{i+45}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-slate-600">Enterprise Java Architecting</p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">Attempted on 12 Oct • 14:30</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-sm font-black text-slate-900">182/200</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-black">
                                            <Award size={14} /> 96.4th
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em]",
                                            i % 4 === 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                                        )}>
                                            {i % 4 === 0 ? 'Failed' : 'Superior'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Results;
