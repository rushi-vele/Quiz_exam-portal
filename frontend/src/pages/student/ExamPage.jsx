import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    ChevronRight, 
    Send, 
    Save, 
    AlertTriangle,
    CheckCircle2,
    Award
} from 'lucide-react';
import { Button, Card } from '../../components/common';
import { API_URL } from '../../context/AuthContext';
import Timer from '../../components/exam/Timer';
import QuestionPalette from '../../components/exam/QuestionPalette';
import QuestionCard from '../../components/exam/QuestionCard';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { cn } from '../../utils/cn';

const ExamPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetchExamData();
        // Load progress from localStorage if exists
        const saved = localStorage.getItem(`exam_progress_${id}`);
        if (saved) {
            setAnswers(JSON.parse(saved));
        }
    }, [id]);

    const [attemptId, setAttemptId] = useState(null);

    useEffect(() => {
        const initializeExam = async () => {
            await fetchExamData();
            await startAttempt();
        };
        initializeExam();
    }, [id]);

    const fetchExamData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/exams/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExam(res.data.exam);
            setQuestions(res.data.questions);
        } catch (err) {
            toast.error('Failed to load exam details');
        } finally {
            setLoading(false);
        }
    };

    const startAttempt = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/attempts/start`, {
                examId: id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttemptId(res.data.id);
            
            // Check if there are saved answers for this attempt in local storage
            const saved = localStorage.getItem(`exam_progress_${id}_${res.data.id}`);
            if (saved) {
                setAnswers(JSON.parse(saved));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initialize attempt');
            if (err.response?.status === 400) navigate('/student');
        }
    };

    const handleAnswerChange = async (val) => {
        const qId = questions[currentIdx].id;
        const newAnswers = { ...answers, [qId]: val };
        setAnswers(newAnswers);
        
        // Auto-save to localStorage
        localStorage.setItem(`exam_progress_${id}_${attemptId}`, JSON.stringify(newAnswers));

        // Background save to server
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/attempts/answers/save`, {
                attemptId,
                questionId: qId,
                answer: val
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTimeout(() => setIsSaving(false), 500);
        } catch (err) {
            console.error('Failed to auto-save answer', err);
            setIsSaving(false);
        }
    };

    const submitExam = async () => {
        if (!window.confirm('Are you sure you want to finish and submit?')) return;
        
        setIsSubmitting(true);
        try {
            toast.loading('Finalizing submission...', { id: 'submit-toast' });
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/attempts/${attemptId}/submit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            localStorage.removeItem(`exam_progress_${id}_${attemptId}`);
            toast.success('Exam submitted successfully!', { id: 'submit-toast' });
            navigate(`/student/results/${attemptId}`);
        } catch (err) {
            toast.error('Submission failed. Please try again.', { id: 'submit-toast' });
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Synchronizing Assessment Data...</p>
        </div>
    );

    if (questions.length === 0) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white gap-6">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 border-2 border-amber-100">
                <AlertTriangle size={48} />
            </div>
            <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Technical Discrepancy</h3>
                <p className="text-slate-500 font-medium mt-1">This assessment contains no validated questions. Status: CRITICAL</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/student')} className="mt-4 uppercase tracking-widest text-xs font-black">
                Return to Safety
            </Button>
        </div>
    );

    return (
        <div className="h-screen bg-[#F9FAFB] flex flex-col overflow-hidden font-sans">
            {/* Exam Header - Fixed Height */}
            <header className="h-20 px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-40 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">QM</div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight">{exam?.title}</h1>
                    </div>
                    <div className="h-8 w-px bg-slate-100"></div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Live Assessment Environment
                        </span>
                        {isSaving && (
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] flex items-center gap-1.5 transition-all">
                                <Save size={12} /> Syncing...
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Timer duration={exam?.duration} onTimeUp={handleSubmit} />
                </div>
            </header>

            {/* Main scrollable content area */}
            <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">
                {/* Question Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8 pb-12">
                        <div className="flex items-center justify-between mb-4">
                            <div className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">
                                Question {currentIdx + 1} of {questions.length}
                            </div>
                            <div className="flex gap-2">
                                {questions.map((_, i) => (
                                    <div key={i} className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        i === currentIdx ? "w-8 bg-primary-600" : "w-1.5 bg-slate-200"
                                    )}></div>
                                ))}
                            </div>
                        </div>

                        <Card className="p-10 border-none shadow-xl shadow-slate-200/50 min-h-[500px]">
                            <QuestionCard 
                                question={questions[currentIdx]} 
                                idx={currentIdx}
                                answer={answers[questions[currentIdx].id]}
                                onAnswerChange={handleAnswerChange}
                                attemptId={attemptId}
                            />
                        </Card>
                    </div>
                </div>

                {/* Sidebar - Scrollable */}
                <div className="w-[380px] border-l border-slate-100 bg-white/50 backdrop-blur-sm overflow-y-auto p-8 custom-scrollbar shrink-0">
                    <div className="space-y-8">
                        <QuestionPalette 
                            questions={questions}
                            currentIdx={currentIdx}
                            answers={answers}
                            onSelect={setCurrentIdx}
                        />
                        
                        <Card className="bg-slate-900 border-none text-white p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 -mt-12 -mr-12 bg-primary-500/20 rounded-full blur-3xl transition-all group-hover:scale-150"></div>
                            <h4 className="font-black uppercase tracking-widest text-[10px] text-primary-400 mb-4">Proctoring Notice</h4>
                            <p className="text-sm font-medium leading-relaxed text-slate-300">
                                This assessment is being monitored. Switching tabs or browsers may result in automatic disqualification.
                            </p>
                            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Questions</span>
                                    <span className="text-xl font-black">{Object.keys(answers).length} / {questions.length}</span>
                                </div>
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                    <Award className="text-primary-500" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Navigation Footer - Fixed Height */}
            <footer className="h-24 px-10 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-40 shadow-[0_-4px_20px_0_rgba(0,0,0,0.03)]">
                <div className="flex gap-4">
                    <Button 
                        variant="outline" 
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx(prev => prev - 1)}
                        className="py-4 px-8 rounded-2xl border-2 font-black uppercase text-xs tracking-widest"
                    >
                        <ChevronLeft size={18} /> Previous Sequence
                    </Button>
                    <Button 
                        variant="outline"
                        disabled={currentIdx === questions.length - 1}
                        onClick={() => setCurrentIdx(prev => prev + 1)}
                        className="py-4 px-8 rounded-2xl border-2 font-black uppercase text-xs tracking-widest"
                    >
                        Next Sequence <ChevronRight size={18} />
                    </Button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Status</p>
                        <p className="text-xs font-bold text-emerald-600 uppercase flex items-center justify-end gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Secure Sync Active
                        </p>
                    </div>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowConfirm(true)}
                        className="bg-slate-900 hover:bg-black py-4 px-10 h-auto rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95"
                    >
                        <Send size={18} /> Submit Assignment
                    </Button>
                </div>
            </footer>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-12 max-w-lg w-full shadow-3xl animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-amber-50 rounded-[32px] flex items-center justify-center text-amber-500 mb-8 mx-auto rotate-3">
                            <AlertTriangle size={48} />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 text-center tracking-tight leading-none">Terminate Session?</h3>
                        <p className="text-slate-500 text-center font-medium mt-6 text-lg leading-relaxed px-4">
                            You've curated responses for <b>{Object.keys(answers).length}</b> variables out of <b>{questions.length}</b>. 
                            <span className="block mt-2 text-slate-400 italic">This action is irreversible.</span>
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-12">
                            <button onClick={() => setShowConfirm(false)} className="py-5 px-8 rounded-3xl border-2 border-slate-100 text-slate-400 font-black uppercase text-xs tracking-widest hover:border-slate-200 hover:text-slate-900 transition-all">Resume Curation</button>
                            <Button variant="primary" onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 py-5 h-auto rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-500/20">Execute Submission</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamPage;
