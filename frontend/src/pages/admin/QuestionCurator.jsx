import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Save, 
    CheckCircle2, 
    Layout, 
    Type, 
    Code, 
    Check,
    MessageSquare,
    Calculator,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const QuestionCurator = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchExamData();
    }, [examId]);

    const fetchExamData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [examRes, qRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/exams/${examId}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`http://localhost:5000/api/questions/${examId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setExam(examRes.data.exam);
            setQuestions(qRes.data);
        } catch (err) {
            toast.error('Failed to load exam data');
        } finally {
            setIsLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: 'new-' + Date.now(),
            question_text: '',
            question_type: 'mcq',
            options: ['', '', '', ''],
            correct_answer: '',
            points: 10
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const removeQuestion = async (id, index) => {
        if (id.toString().startsWith('new')) {
            setQuestions(questions.filter((_, i) => i !== index));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/questions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Question deleted');
            setQuestions(questions.filter((_, i) => i !== index));
        } catch (err) {
            toast.error('Failed to delete question');
        }
    };

    const saveQuestions = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const newQs = questions.filter(q => q.id.toString().startsWith('new'));
            const existingQs = questions.filter(q => !q.id.toString().startsWith('new'));

            // Batch Add new ones
            if (newQs.length > 0) {
                await axios.post('http://localhost:5000/api/questions/add', {
                    examId,
                    questions: newQs
                }, { headers: { Authorization: `Bearer ${token}` } });
            }

            // Update existing ones individually (or implement batch update)
            for (const q of existingQs) {
                await axios.put(`http://localhost:5000/api/questions/${q.id}`, q, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            toast.success('Question portfolio synchronized!');
            fetchExamData();
        } catch (err) {
            toast.error('Failed to synchronize questions');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary-600" size={40} />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Initialising Curator...</p>
        </div>
    );

    const totalPoints = questions.reduce((acc, q) => acc + parseInt(q.points || 0), 0);

    return (
        <div className="space-y-8 pb-32">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <button 
                        onClick={() => navigate('/admin/exams')}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors mb-4"
                    >
                        <ArrowLeft size={16} /> Back to Repository
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{exam?.title}</h1>
                    <p className="text-slate-500 font-medium mt-1">Curate and validate the question portfolio for this assessment.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Weightage</span>
                        <span className={`text-2xl font-black ${totalPoints === exam?.total_marks ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {totalPoints} / {exam?.total_marks} Pts
                        </span>
                    </div>
                    <Button variant="primary" onClick={saveQuestions} isLoading={isSaving} className="shadow-xl">
                        <Save size={18} /> Sync Portfolio
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Statistics Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    <Card className="bg-[#0F172A] text-white border-none shadow-2xl">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Metrics Dashboard</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Check size={16} /></div>
                                    <span className="text-sm font-bold">Questions</span>
                                </div>
                                <span className="text-lg font-black">{questions.length}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Calculator size={16} /></div>
                                    <span className="text-sm font-bold">Total Marks</span>
                                </div>
                                <span className="text-lg font-black">{totalPoints}</span>
                            </div>
                            <div className="pt-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2 text-primary-400">
                                        <ShieldCheck size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Integrity Check</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        {totalPoints === exam?.total_marks 
                                            ? "Metrics are perfectly aligned with assessment blueprint." 
                                            : `Points mismatch detected. Portfolio requires ${Math.abs(exam?.total_marks - totalPoints)} more Pts to balance.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Button variant="outline" className="w-full py-4 border-2 font-black text-primary-600 border-primary-100 hover:bg-primary-50" onClick={addQuestion}>
                        <Plus size={18} /> Append New Query
                    </Button>
                </div>

                {/* Questions List */}
                <div className="xl:col-span-3 space-y-8">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-white border-2 border-slate-100 rounded-[32px] p-10 shadow-sm hover:border-primary-200 transition-all relative group">
                            <div className="absolute top-10 left-[-16px] w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center text-sm font-black shadow-xl ring-8 ring-white">
                                {idx + 1}
                            </div>
                            <button 
                                onClick={() => removeQuestion(q.id, idx)}
                                className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-2"
                            >
                                <Trash2 size={22} />
                            </button>

                            <div className="space-y-8">
                                <div className="grid grid-cols-12 gap-8">
                                    <div className="col-span-12 lg:col-span-8 space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <MessageSquare size={12} /> Question Statement
                                        </label>
                                        <textarea 
                                            className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-3xl py-5 px-8 text-sm font-semibold h-32 resize-none transition-all outline-none leading-relaxed"
                                            placeholder="Formulate the inquiry..."
                                            value={q.question_text}
                                            onChange={e => updateQuestion(idx, 'question_text', e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="col-span-12 lg:col-span-4 space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Type size={14} /> Evaluation Model
                                            </label>
                                            <select 
                                                className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-5 px-6 text-sm font-black transition-all outline-none"
                                                value={q.question_type}
                                                onChange={e => updateQuestion(idx, 'question_type', e.target.value)}
                                            >
                                                <option value="mcq">Multiple Choice (MCQ)</option>
                                                <option value="short_answer">Short Narrative</option>
                                                <option value="coding">Algorithmic Implementation</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Calculator size={14} /> Question Weightage
                                            </label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-5 px-8 text-sm font-black transition-all outline-none"
                                                value={q.points}
                                                onChange={e => updateQuestion(idx, 'points', e.target.value)}
                                                placeholder="Pts"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Input Area */}
                                <div className="pt-8 border-t border-slate-100">
                                    {q.question_type === 'mcq' && (
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Response Options</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={optIdx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-50 focus-within:border-primary-200 transition-all">
                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 uppercase">{String.fromCharCode(65 + optIdx)}</div>
                                                        <input 
                                                            type="text" 
                                                            placeholder={`Option ${optIdx + 1} content...`}
                                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                                            value={opt}
                                                            onChange={e => updateOption(idx, optIdx, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {q.question_type === 'coding' && (
                                        <div className="flex items-center gap-4 p-6 bg-slate-900 rounded-3xl text-white">
                                            <Code className="text-primary-400" size={24} />
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-widest">Algorithmic Workspace Integrated</p>
                                                <p className="text-xs text-slate-400 font-medium">Students will be provided with a Monaco Editor environment for this task.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Validation String (Correct Answer)</label>
                                        <div className="relative">
                                            <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-5 pl-16 pr-8 text-sm font-black transition-all outline-none"
                                                placeholder={q.question_type === 'mcq' ? "Must match exactly one of the options above..." : "Expected keyword or output value..."}
                                                value={q.correct_answer}
                                                onChange={e => updateQuestion(idx, 'correct_answer', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {questions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-200">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl mb-6">
                                <Plus className="text-slate-300" size={40} />
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Empty Portfolio</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">Begin adding questions to activate this assessment.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Sticky Save Bar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm">
                <Button 
                    variant="primary" 
                    className="w-full py-5 rounded-3xl shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 text-lg"
                    onClick={saveQuestions}
                    isLoading={isSaving}
                >
                    <Save size={24} /> Deploy All Changes
                </Button>
            </div>
        </div>
    );
};

export default QuestionCurator;
