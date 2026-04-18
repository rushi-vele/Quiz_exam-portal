import React, { useState, useEffect } from 'react';
import { 
    Trophy, 
    Crown, 
    TrendingUp, 
    Search,
    Filter,
    Award,
    Clock,
    Target,
    Zap
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import API from '../../api/api';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('global');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Admins see all exams for leaderboard, students see only active
                const examUrl = user?.role === 'admin' ? '/exams' : '/exams/active';
                const [examsRes, leaderRes] = await Promise.all([
                    API.get(examUrl),
                    API.get('/leaderboard/global')
                ]);
                setExams(examsRes.data);
                setLeaderboardData(leaderRes.data);
            } catch (err) {
                toast.error('Failed to load rankings');
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchInitialData();
    }, [user]);

    const handleExamChange = async (examId) => {
        setIsLoading(true);
        setSelectedExamId(examId);
        try {
            const url = examId === 'global' ? '/leaderboard/global' : `/leaderboard/${examId}`;
            const res = await API.get(url);
            setLeaderboardData(res.data);
        } catch (err) {
            toast.error('Failed to update leaderboard');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredData = leaderboardData.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.exam_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const topThree = filteredData.slice(0, 3);
    const rest = filteredData.slice(3);

    if (isLoading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Calculating Standings...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">Elite <span className="text-primary-600">Leaderboard</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Recognizing excellence across all academic assessments.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            className="bg-white border-2 border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary-500 appearance-none min-w-[200px]"
                            value={selectedExamId}
                            onChange={(e) => handleExamChange(e.target.value)}
                        >
                            <option value="global">All Assessments (Global)</option>
                            {exams.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Top 3 Podium */}
            {topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end relative py-10">
                    <div className="absolute inset-0 bg-primary-600/5 blur-[120px] rounded-full pointer-events-none"></div>
                    
                    {/* 2nd Place */}
                    {topThree[1] && (
                        <div className="order-2 md:order-1 flex flex-col items-center">
                            <Card className="w-full text-center p-8 bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl transition-all hover:-translate-y-2 group">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black mx-auto mb-4">
                                    {topThree[1].name.charAt(0)}
                                </div>
                                <h4 className="text-lg font-black text-slate-900 leading-tight mb-1 truncate w-full px-2">{topThree[1].name}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 truncate w-full">{topThree[1].exam_title}</p>
                                <div className="text-3xl font-black text-slate-900 leading-none mb-2">{topThree[1].total_score}</div>
                                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{topThree[1].percentage}% Accuracy</p>
                            </Card>
                            <div className="w-16 h-10 bg-slate-100 rounded-b-2xl shadow-inner flex items-center justify-center font-black text-slate-300">#2</div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                        <div className="order-1 md:order-2 flex flex-col items-center">
                            <Card className="w-full text-center p-10 bg-primary-600 border-none shadow-3xl shadow-primary-600/30 text-white relative overflow-hidden transition-all hover:-translate-y-4 scale-105 z-10">
                                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/20 rounded-full blur-3xl"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black mb-6 border-2 border-white/20 shadow-xl text-yellow-300">
                                        <Crown size={40} />
                                    </div>
                                    <h4 className="text-xl font-black tracking-tight leading-tight mb-1 truncate w-full">{topThree[0].name}</h4>
                                    <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-8 truncate w-full">{topThree[0].exam_title}</p>
                                    <div className="text-5xl font-black leading-none mb-3">{topThree[0].total_score}</div>
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{topThree[0].percentage}% Performance</p>
                                </div>
                            </Card>
                            <div className="w-20 h-14 bg-primary-700 rounded-b-3xl shadow-inner flex items-center justify-center font-black text-white/20 text-xl">#1</div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <div className="order-3 md:order-3 flex flex-col items-center">
                            <Card className="w-full text-center p-8 bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl transition-all hover:-translate-y-2 group">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center font-black mx-auto mb-4">
                                    {topThree[2].name.charAt(0)}
                                </div>
                                <h4 className="text-lg font-black text-slate-900 leading-tight mb-1 truncate w-full px-2">{topThree[2].name}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 truncate w-full">{topThree[2].exam_title}</p>
                                <div className="text-3xl font-black text-slate-900 leading-none mb-2">{topThree[2].total_score}</div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{topThree[2].percentage}% Ratio</p>
                            </Card>
                            <div className="w-16 h-8 bg-slate-50 rounded-b-2xl shadow-inner flex items-center justify-center font-black text-slate-200 uppercase text-[10px]">#3</div>
                        </div>
                    )}
                </div>
            )}

            <Card className="mt-10 overflow-visible">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Award className="text-primary-600" /> Merit Standings
                    </h3>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                            className="input-field pl-10 py-2.5 text-xs font-bold" 
                            placeholder="Find student performance..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {rest.length > 0 ? rest.map((item, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "flex items-center justify-between p-5 rounded-3xl border-2 transition-all hover:bg-slate-50/30 group flex-wrap sm:flex-nowrap gap-4",
                                item.user_id === user?.id ? "border-primary-500 bg-primary-50/10 shadow-lg shadow-primary-500/5" : "border-slate-50 hover:border-primary-100"
                            )}>
                            <div className="flex items-center gap-6">
                                <span className={cn(
                                    "w-10 text-xl font-black transition-colors",
                                    item.user_id === user?.id ? "text-primary-600" : "text-slate-300 group-hover:text-primary-600"
                                )}>#{index + 4}</span>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm border-2",
                                        item.user_id === user?.id ? "bg-primary-600 text-white border-primary-400" : "bg-white text-slate-900 border-slate-100"
                                    )}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className="text-base font-black text-slate-900 leading-tight flex items-center gap-3">
                                            {item.name}
                                            {item.user_id === user?.id && (
                                                <span className="bg-primary-600 px-2 py-0.5 rounded-full text-[8px] text-white uppercase tracking-widest">You</span>
                                            )}
                                        </h5>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Target size={12} className="text-slate-300" /> {item.exam_title}
                                            </span>
                                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <Zap size={12} /> {item.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Efficiency</p>
                                    <p className="text-sm font-black text-slate-900 leading-none flex items-center gap-1.5 justify-end">
                                        <Clock size={12} className="text-slate-300" /> {Math.floor(item.time_taken / 60)}m {item.time_taken % 60}s
                                    </p>
                                </div>
                                <div className="text-right min-w-[80px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Marks</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{item.total_score}</p>
                                </div>
                            </div>
                        </div>
                    )) : rest.length === 0 && topThree.length === 0 ? (
                        <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                            <Trophy size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No ranking data available for this selection.</p>
                        </div>
                    ) : null}
                </div>
            </Card>
        </div>
    );
};

export default Leaderboard;
