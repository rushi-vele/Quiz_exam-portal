import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { toast } from 'react-hot-toast';
import { 
    Trophy, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ChevronRight, 
    Home,
    BarChart3,
    ArrowLeft,
    Download,
    History as HistoryIcon,
    Award,
    Target
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import { cn } from '../../utils/cn';

const ResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (id) {
                    // Single Result Mode
                    const res = await API.get(`/results/attempt/${id}`);
                    setResultData(res.data);
                    
                    // Fetch leaderboard for this exam
                    const lbRes = await API.get(`/leaderboard/exam/${res.data.exam_id}`);
                    setLeaderboard(lbRes.data);
                } else {
                    // History Mode
                    const historyRes = await API.get('/results/my-results');
                    setHistoryData(historyRes.data);
                }
            } catch (err) {
                toast.error('Failed to load assessment data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Syncing Performance Data...</div>;

    // --- RENDER HISTORY LIST ---
    if (!id) {
        return (
            <div className="space-y-10 pb-20 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">Performance <span className="text-primary-600">History</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Audit trail of all your submitted assessments and performance trends.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {historyData.length === 0 ? (
                        <div className="py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                            <HistoryIcon size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No historical assessments found.</p>
                            <Button variant="primary" className="mt-6" onClick={() => navigate('/student/exams')}>Explore Exams</Button>
                        </div>
                    ) : (
                        historyData.map((item) => (
                            <Card key={item.id} className="group hover:ring-2 hover:ring-primary-100 transition-all border-none shadow-sm bg-white">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-2">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                            item.percentage >= 40 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                        )}>
                                            {item.percentage >= 40 ? <Trophy size={28} /> : <XCircle size={28} />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{item.title}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock size={12} /> {new Date(item.end_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    item.percentage >= 40 ? "text-emerald-600" : "text-red-600"
                                                )}>
                                                    {item.percentage >= 40 ? 'Certified Pass' : 'Academic Failure'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Result</p>
                                            <p className="text-2xl font-black text-slate-900 leading-none">{Math.round(item.percentage)}%</p>
                                        </div>
                                        <div className="h-10 w-px bg-slate-100"></div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Score</p>
                                            <p className="text-xl font-black text-slate-600 leading-none">{item.score} <span className="text-slate-300 text-sm">/ {item.total_marks}</span></p>
                                        </div>
                                        <Button 
                                            variant="primary" 
                                            className="px-6 group-hover:px-8 transition-all"
                                            onClick={() => navigate(`/student/results/${item.id}`)}
                                        >
                                            Analysis <ChevronRight size={18} className="ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER SINGLE RESULT FEEDBACK ---
    if (!resultData) return <div className="p-20 text-center">Data mismatch. Please return to dashboard.</div>;

    const isPass = (resultData.percentage || 0) >= 40;

    return (
        <div className="space-y-10 pb-20 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/student/results')}
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Portfolio</h1>
                    <p className="text-slate-500 font-medium">Detailed feedback and score analysis for {resultData.exam_title}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className={cn(
                    "md:col-span-2 relative overflow-hidden flex flex-col items-center justify-center py-12 text-center border-none shadow-2xl transition-all duration-700",
                    isPass ? "bg-emerald-600 shadow-emerald-600/20" : "bg-red-600 shadow-red-600/20"
                )}>
                    <div className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 -ml-20 -mb-20 bg-black/10 rounded-full blur-2xl animate-pulse delay-700"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl border border-white/20">
                            {isPass ? <Trophy size={48} /> : <XCircle size={48} />}
                        </div>
                        
                        <div>
                            <h2 className="text-5xl font-black text-white tracking-widest leading-none mb-2">{Math.round(resultData.percentage)}%</h2>
                            <p className="text-white/70 font-bold uppercase tracking-[0.3em] text-xs">Final Evaluation Percentage</p>
                        </div>

                        <div className={cn(
                            "inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest",
                            isPass ? "bg-emerald-500 text-white border border-white/20" : "bg-red-500 text-white border border-white/20"
                        )}>
                            {isPass ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            {isPass ? 'CERTIFIED PASS' : 'CRITICAL FAILURE'}
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6 border-slate-200">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score Obtained</p>
                                    <h4 className="text-xl font-black text-slate-900">{resultData.score} / {resultData.total_marks}</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attempt Duration</p>
                                    <h4 className="text-xl font-black text-slate-900">{Math.floor((resultData.time_taken || 0) / 60)}m {(resultData.time_taken || 0) % 60}s</h4>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Button variant="outline" className="w-full py-4 text-xs tracking-widest uppercase font-black border-2" onClick={() => window.print()}>
                        <Download size={18} /> Export Results
                    </Button>
                </div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Comparative Rankings" className="h-full">
                    <div className="space-y-4 mt-6">
                        {leaderboard.length > 0 ? leaderboard.slice(0, 5).map((entry, idx) => (
                            <div key={idx} className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                entry.name === resultData.user_name ? "border-primary-600 bg-primary-50/50" : "border-slate-50"
                            )}>
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black",
                                        idx === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                                    )}>
                                        #{idx + 1}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700">{entry.name}</span>
                                </div>
                                <span className={cn(
                                    "text-sm font-black text-slate-900",
                                    entry.name === resultData.user_name && "text-primary-600"
                                )}>
                                    {entry.total_score} Pts
                                </span>
                            </div>
                        )) : (
                            <p className="py-10 text-center text-slate-400 text-xs font-black uppercase tracking-widest">Calculated rankings not available</p>
                        )}
                    </div>
                </Card>

                <Card title="Performance Distribution" className="h-full shadow-sm">
                    <div className="space-y-5 mt-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Achieved Proficiency</h5>
                                <span className="text-sm font-black text-slate-900">{Math.round(resultData.percentage)}%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                                <div 
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        isPass ? "bg-emerald-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${resultData.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className={cn("text-lg font-black leading-none", isPass ? "text-emerald-600" : "text-red-600")}>
                                    {isPass ? 'PASSED' : 'FAILED'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Questions</p>
                                <p className="text-lg font-black text-slate-900 leading-none">
                                    {resultData.total_questions || 0} Total
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Answer Review</h2>
                        <p className="text-sm font-medium text-slate-500">In-depth analysis of your responses and correct benchmarks</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correct</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incorrect</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {resultData.questions && resultData.questions.length > 0 ? (
                        resultData.questions.map((q, idx) => (
                            <Card key={idx} className={cn(
                                "p-8 border-2 transition-all duration-300",
                                q.is_correct ? "border-emerald-100 bg-emerald-50/20" : "border-red-100 bg-red-50/20"
                            )}>
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex gap-4">
                                            <span className="flex-none w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xl">
                                                {idx + 1}
                                            </span>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-slate-800 leading-snug">{q.question_text}</h3>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-widest border border-slate-200/50">
                                                        {q.question_type?.replace('_', ' ')}
                                                    </span>
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                        q.is_correct ? "bg-emerald-100 text-emerald-600 border-emerald-200" : "bg-red-100 text-red-600 border-red-200"
                                                    )}>
                                                        {q.marks_obtained}/{q.points} Marks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                                            q.is_correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                        )}>
                                            {q.is_correct ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1 h-3 bg-slate-200 rounded-full"></div>
                                                Your Response
                                            </h4>
                                            <div className={cn(
                                                "p-4 rounded-2xl border-2 font-medium text-sm transition-all whitespace-pre-wrap",
                                                q.question_type === 'coding' ? "font-mono bg-slate-900 text-slate-100 border-slate-700" :
                                                q.is_correct ? "bg-emerald-50/30 border-emerald-200/50 text-emerald-700" : "bg-red-50/30 border-red-200/50 text-red-700"
                                            )}>
                                                {q.submitted_answer || <span className="italic opacity-50">No response provided</span>}
                                            </div>
                                        </div>

                                        {!q.is_correct && (
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-1 h-3 bg-emerald-300 rounded-full"></div>
                                                    Valid Benchmark
                                                </h4>
                                                <div className={cn(
                                                    "p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200/50 text-emerald-700 font-bold text-sm whitespace-pre-wrap",
                                                    q.question_type === 'coding' ? "font-mono" : ""
                                                )}>
                                                    {q.correct_answer || 'Reference benchmark not set'}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {q.options && q.options.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                                            {q.options.map((option, oIdx) => (
                                                <div key={oIdx} className={cn(
                                                    "p-3 rounded-xl border text-xs font-medium transition-all text-center md:text-left",
                                                    option === q.correct_answer ? "bg-emerald-50 border-emerald-500/30 text-emerald-700 ring-2 ring-emerald-500/20 font-bold" : 
                                                    (option === q.submitted_answer && !q.is_correct) ? "bg-red-50 border-red-500/30 text-red-700 font-black" : "bg-slate-50 border-slate-200 text-slate-500 grayscale opacity-60"
                                                )}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center font-black text-[10px]">
                                                            {String.fromCharCode(65 + oIdx)}
                                                        </span>
                                                        {option}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50/50">
                            <Target size={40} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs leading-relaxed">Detailed session metrics are not available<br/>for this historical assessment</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="flex justify-center pt-8">
                <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => navigate('/student')}
                    className="gap-4 px-12 text-white font-black tracking-widest uppercase shadow-xl shadow-primary-600/20"
                >
                    <Home size={20} /> Dashboard Home
                </Button>
            </div>
        </div>
    );
};

export default ResultPage;
