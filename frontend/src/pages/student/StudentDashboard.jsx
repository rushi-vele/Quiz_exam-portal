import React, { useState, useEffect, useContext } from 'react';
import { 
    Clock, 
    Calendar, 
    Trophy, 
    ChevronRight,
    PlayCircle,
    CheckCircle,
    Timer,
    Award,
    AlertCircle,
    RotateCcw
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { cn } from '../../utils/cn';
import { AuthContext } from '../../context/AuthContext';

const StudentDashboard = () => {
    const [activeExams, setActiveExams] = useState([]);
    const [recentResults, setRecentResults] = useState([]);
    const [retakeRequests, setRetakeRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, resultsRes, retakeRes] = await Promise.all([
                    API.get('/exams/active'),
                    API.get('/results/my-results'),
                    API.get('/retake/my-requests')
                ]);
                setActiveExams(examsRes.data);
                setRecentResults(resultsRes.data);
                setRetakeRequests(retakeRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Loading Dashboard...</div>;

    const avgScore = recentResults.length > 0 
        ? Math.round(recentResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / recentResults.length) 
        : 0;

    const handleRequestRetake = async (examId) => {
        try {
            await API.post('/retake/request', { examId, reason: 'Requesting a re-attempt to improve score.' });
            toast.success('Retake request submitted to administrator.');
            // Refresh data
            const res = await API.get('/retake/my-requests');
            setRetakeRequests(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        }
    };

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase font-heading">
                        Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0]}!</span> 👋
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">You have {activeExams.length} active assessments available to attempt.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="px-4 py-2 text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
                        <p className="text-lg font-black text-slate-900 leading-none mt-1">{recentResults.length}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-100"></div>
                    <div className="px-4 py-2 text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Score</p>
                        <p className="text-lg font-black text-slate-900 leading-none mt-1">{avgScore}%</p>
                    </div>
                </div>
            </div>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Clock className="text-primary-600" /> Live Assessments
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeExams.map(exam => (
                        <Card key={exam.id} className="hover:border-primary-200 transition-all group overflow-hidden">
                            <div className="flex flex-col h-full relative">
                                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10 opacity-50"></div>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="bg-primary-50 p-3 rounded-2xl text-primary-600 transition-transform group-hover:rotate-6">
                                        <PlayCircle size={28} />
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        Active
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-primary-600 transition-colors">
                                    {exam.title}
                                </h3>
                                
                                <div className="space-y-3 mb-8 flex-1">
                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                        <Timer size={16} className="text-slate-400" /> <span>{exam.duration} Minutes</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                        <CheckCircle size={16} className="text-slate-400" /> <span>{exam.total_questions} Questions</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                        <Award size={16} className="text-slate-400" /> <span>{exam.total_marks} Total Marks</span>
                                    </div>
                                </div>

                                {recentResults.some(r => r.exam_id === exam.id) ? (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                            <CheckCircle className="text-emerald-500" size={18} />
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Assessment Completed</span>
                                        </div>
                                        {retakeRequests.some(rr => rr.exam_id === exam.id && rr.status === 'pending') ? (
                                            <Button variant="outline" className="w-full border-amber-200 text-amber-600 bg-amber-50 cursor-default" disabled>
                                                <Clock size={16} className="mr-2" /> Pending Retake Review
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="outline" 
                                                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
                                                onClick={() => handleRequestRetake(exam.id)}
                                            >
                                                <RotateCcw size={16} className="mr-2" /> Request Re-attempt
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <Button 
                                        variant="primary" 
                                        className="w-full justify-between pr-4 group-hover:shadow-lg group-hover:shadow-primary-600/20"
                                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                                    >
                                        Initiate Assessment <ChevronRight size={18} />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                    {activeExams.length === 0 && (
                        <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No active exams available at the moment.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Trophy className="text-amber-500" /> Recent Academic Performance
                    </h2>
                    <Card className="border-none ring-1 ring-slate-100 overflow-hidden">
                        <div className="space-y-6">
                            {recentResults.map((res, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all" onClick={() => navigate(`/student/results/${res.id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs",
                                            res.percentage >= 40 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {Math.round(res.percentage)}%
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-primary-600 transition-colors uppercase">{res.title}</h4>
                                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Score: {res.score} / {res.total_marks}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                        res.percentage >= 40 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                                    )}>
                                        {res.percentage >= 40 ? 'Pass' : 'Fail'}
                                    </span>
                                </div>
                            ))}
                            {recentResults.length === 0 && (
                                <p className="text-slate-400 font-medium text-sm text-center py-4">No attempts recorded yet.</p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        📬 Intelligence Feed
                    </h2>
                    <div className="space-y-4">
                        {[
                            'Final Assessment results for Backend Engineering are out.',
                            'Your average score has increased by 12% this month.',
                            'New Exam: Cloud Infrastructure Mastery (AWS).',
                        ].map((msg, i) => (
                            <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                                <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0"></span>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed">{msg}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StudentDashboard;
