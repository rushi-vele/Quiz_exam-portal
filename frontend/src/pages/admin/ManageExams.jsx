import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    MoreVertical, 
    FileText,
    Edit3,
    Trash2,
    CheckCircle2,
    X,
    PlusCircle,
    MinusCircle,
    Save,
    LayoutDashboard,
    Clock,
    Award,
    PlusSquare,
    ArrowLeft
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

const ManageExams = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [currentStep, setCurrentStep] = useState(0); 
    const [createdExamId, setCreatedExamId] = useState(null);

    const [newExam, setNewExam] = useState({
        title: '',
        description: '',
        duration: '',
        total_marks: 100,
        passing_marks: 40,
        totalQuestions: 10,
        defaultMarks: 10,
        published: true
    });

    const [questions, setQuestions] = useState([]);

    const validateBlueprint = () => {
        return (
            newExam.title && 
            newExam.title.trim() !== '' &&
            newExam.description && 
            newExam.description.trim() !== '' &&
            newExam.duration && 
            parseInt(newExam.duration) > 0 &&
            newExam.total_marks && 
            parseInt(newExam.total_marks) > 0 &&
            newExam.totalQuestions && 
            parseInt(newExam.totalQuestions) > 0
        );
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await API.get('/exams');
            setExams(res.data);
        } catch (err) {
            toast.error('Failed to load exams');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrUpdateExam = async (e) => {
        e.preventDefault();
        
        if (parseInt(newExam.duration) <= 0 || parseInt(newExam.total_marks) <= 0) {
            return toast.error('Duration and Marks must be positive integers');
        }

        try {
            if (isEditing) {
                await API.put(`/exams/${editingExamId}`, newExam);
                toast.success('Exam blueprint updated successfully!');
                setShowModal(false);
                resetForm();
            } else {
                const res = await API.post('/exams', newExam);
                toast.success('Blueprint initialized! Now curate your questions.');
                setCreatedExamId(res.data.id);
                setCurrentStep(1);
            }
            fetchExams(); 
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (exam) => {
        setIsEditing(true);
        setEditingExamId(exam.id);
        setNewExam({
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            total_marks: exam.total_marks,
            passing_marks: exam.passing_marks,
            totalQuestions: exam.total_questions,
            defaultMarks: Math.floor(exam.total_marks / exam.total_questions) || 10,
            published: exam.published === 1
        });
        setCurrentStep(0);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assessment? This will erase all questions and student attempts irreversibly.')) return;
        
        try {
            await API.delete(`/exams/${id}`);
            toast.success('Assessment eradicated successfully');
            setExams(exams.filter(e => e.id !== id));
        } catch (err) {
            toast.error('Failed to delete exam');
        }
    };

    const addQuestionField = () => {
        if (questions.length >= newExam.totalQuestions) {
            return toast.error(`Limit of ${newExam.totalQuestions} questions reached.`);
        }
        setQuestions([...questions, {
            question_text: '',
            question_type: 'mcq',
            options: ['', '', '', ''],
            correct_answer: '',
            points: newExam.defaultMarks
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

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSaveQuestions = async () => {
        if (questions.length !== parseInt(newExam.totalQuestions)) {
            return toast.error(`Please add exactly ${newExam.totalQuestions} questions.`);
        }
        
        const currentTotalPoints = questions.reduce((acc, q) => acc + parseInt(q.points || 0), 0);
        if (currentTotalPoints !== parseInt(newExam.total_marks)) {
            return toast.error(`Total marks sum (${currentTotalPoints}) must match Exam marks (${newExam.total_marks}).`);
        }

        try {
            await API.post('/questions/add', {
                examId: createdExamId,
                questions: questions.map(q => ({
                    ...q,
                    options: q.question_type === 'mcq' ? q.options : []
                }))
            });
            
            toast.success('All questions saved successfully!');
            setShowModal(false);
            resetForm();
            fetchExams();
        } catch (err) {
            toast.error('Failed to save questions');
        }
    };

    const handlePublish = async (id) => {
        if (!window.confirm('Are you sure you want to publish this exam? This will make it visible to all students instantly.')) return;
        
        try {
            await API.put(`/exams/${id}/publish`);
            toast.success('Exam Published Successfully');
            fetchExams();
        } catch (err) {
            toast.error('Failed to publish exam');
        }
    };

    const draftCount = exams.filter(e => !e.published).length;
    const publishedCount = exams.filter(e => e.published).length;

    const resetForm = () => {
        setNewExam({ title: '', description: '', duration: '', total_marks: 100, passing_marks: 40, totalQuestions: 10, defaultMarks: 10 });
        setQuestions([]);
        setCurrentStep(0);
        setCreatedExamId(null);
        setIsEditing(false);
        setEditingExamId(null);
    };

    return (
        <div className="space-y-8 pb-12 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">Admin Portal</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{draftCount} Drafts</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{publishedCount} Published</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate('/admin/questions')} className="border-2 font-black text-slate-600 hover:text-slate-900">
                        <PlusSquare size={18} /> Import Intelligence
                    </Button>
                    <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus size={18} /> Design New Assessment
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 flex flex-col max-h-[calc(100vh-200px)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-white shrink-0 rounded-t-2xl z-20 border-b border-slate-50">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search active assessments..." 
                            className="w-full bg-slate-50/50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-8 pb-8 relative min-h-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Registry...</p>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                            <BookOpen size={48} className="text-slate-200 mb-4" />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No active assessments found</p>
                            <Button variant="outline" size="sm" className="mt-4 font-black" onClick={() => setShowModal(true)}>Design Your First Exam</Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto min-w-full">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-white/95 backdrop-blur-md">
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Exam ID</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Title</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Duration</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Metrics</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Status</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {exams.map((exam) => (
                                        <tr key={exam.id} className="hover:bg-slate-50/70 transition-all group">
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100 whitespace-nowrap uppercase tracking-widest leading-none">ID-{exam.id.toString().padStart(3, '0')}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <h5 className="text-sm font-black text-slate-900 leading-tight mb-1">{exam.title}</h5>
                                                <p className="text-xs font-medium text-slate-400 line-clamp-1">{exam.description || 'No description provided.'}</p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                                    <Clock size={14} className="text-slate-400" /> {exam.duration}m
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center whitespace-nowrap">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-sm font-black text-slate-900">{exam.total_marks} Marks</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exam.total_questions} Questions</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {exam.published ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                                                        <CheckCircle2 size={12} /> Active
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handlePublish(exam.id)}
                                                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                                    >
                                                        <Clock size={12} className="group-hover:animate-pulse" /> Draft · Publish
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-9 text-[10px] font-black uppercase tracking-widest border-primary-200 text-primary-600 hover:bg-primary-50 px-4"
                                                        onClick={() => navigate(`/admin/exams/${exam.id}/questions`)}
                                                    >
                                                        <PlusSquare size={14} /> Questions
                                                    </Button>
                                                    <button 
                                                        onClick={() => handleEdit(exam)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:shadow-lg transition-all"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(exam.id)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Design Assessment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white rounded-[32px] shadow-3xl animate-in fade-in zoom-in duration-300 flex flex-col border border-slate-200/50">
                        {/* Modal Header */}
                        <div className="px-10 py-6 bg-[#0F172A] text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-black tracking-tight">{currentStep === 0 ? (isEditing ? 'Update Blueprint' : 'Assessment Blueprint') : 'Curate Question Portfolio'}</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">
                                    {currentStep === 0 ? 'Define the fundamental parameters of the examination.' : `Step 2: Add ${newExam.totalQuestions} mandatory questions.`}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white border border-white/10">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 custom-scrollbar">
                            {currentStep === 0 ? (
                                <form id="exam-form" onSubmit={handleCreateOrUpdateExam} className="space-y-8 max-w-2xl mx-auto">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Technical Specifications</h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Examination Title</label>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        className="w-full bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none transition-all"
                                                        placeholder="e.g. Fullstack Architecture Mastery"
                                                        value={newExam.title}
                                                        onChange={e => setNewExam({...newExam, title: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duration (Minutes)</label>
                                                    <input 
                                                        type="number" 
                                                        required
                                                        className="w-full bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-3.5 px-6 font-black outline-none transition-all"
                                                        value={newExam.duration}
                                                        onChange={e => setNewExam({...newExam, duration: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block">Total Marks</label>
                                                    <input 
                                                        type="number" 
                                                        required
                                                        className="w-full text-center bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-3.5 font-black outline-none transition-all"
                                                        value={newExam.total_marks}
                                                        onChange={e => setNewExam({...newExam, total_marks: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block">Questions</label>
                                                    <input 
                                                        type="number" 
                                                        required
                                                        className="w-full text-center bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-3.5 font-black outline-none transition-all"
                                                        value={newExam.totalQuestions}
                                                        onChange={e => setNewExam({...newExam, totalQuestions: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block">Pass Thresh.</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full text-center bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-3.5 font-black outline-none transition-all"
                                                        value={newExam.passing_marks}
                                                        onChange={e => setNewExam({...newExam, passing_marks: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Curriculum Snapshot</label>
                                                <textarea 
                                                    className="w-full bg-white border-2 border-slate-100 focus:border-primary-500 rounded-2xl py-4 px-6 text-sm font-semibold h-32 resize-none custom-scrollbar outline-none transition-all"
                                                    placeholder="Specify the syllabus and topics included..."
                                                    required
                                                    value={newExam.description}
                                                    onChange={e => setNewExam({...newExam, description: e.target.value})}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm shadow-slate-100/50">
                                        <div className="flex gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curation Progress</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-black text-slate-900">{questions.length} / {newExam.totalQuestions}</span>
                                                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary-600 transition-all duration-500" style={{ width: `${(questions.length / newExam.totalQuestions) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col border-l border-slate-100 pl-8">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Metrics Accuracy</span>
                                                <span className={cn(
                                                    "text-2xl font-black",
                                                    questions.reduce((acc, q) => acc + parseInt(q.points || 0), 0) === parseInt(newExam.total_marks) ? "text-emerald-600" : "text-amber-600"
                                                )}>
                                                    {questions.reduce((acc, q) => acc + parseInt(q.points || 0), 0)} / {newExam.total_marks} Pts
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="outline" onClick={addQuestionField} className="border-2 font-black">
                                            <Plus size={18} /> Append Question
                                        </Button>
                                    </div>

                                    <div className="space-y-6 pb-20">
                                        {questions.map((q, idx) => (
                                            <div key={idx} className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm hover:border-primary-100 transition-all relative group">
                                                <div className="absolute top-8 left-[-16px] w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center text-xs font-black shadow-lg">
                                                    {idx + 1}
                                                </div>
                                                <button onClick={() => removeQuestion(idx)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    <MinusCircle size={20} />
                                                </button>

                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-12 gap-6">
                                                        <div className="col-span-12 lg:col-span-8 space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Statement</label>
                                                            <textarea 
                                                                className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-4 px-6 text-sm font-semibold h-24 resize-none transition-all outline-none"
                                                                placeholder="Present the problem or query..."
                                                                value={q.question_text}
                                                                onChange={e => updateQuestion(idx, 'question_text', e.target.value)}
                                                            ></textarea>
                                                        </div>
                                                        <div className="col-span-12 lg:col-span-4 space-y-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Query Type</label>
                                                                <select 
                                                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-4 px-4 text-sm font-bold transition-all outline-none"
                                                                    value={q.question_type}
                                                                    onChange={e => updateQuestion(idx, 'question_type', e.target.value)}
                                                                >
                                                                    <option value="mcq">Multiple Choice</option>
                                                                    <option value="short_answer">Response based</option>
                                                                    <option value="coding">Algorithmic Task</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weighted Marks</label>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-4 px-6 text-sm font-black transition-all outline-none"
                                                                    value={q.points}
                                                                    onChange={e => updateQuestion(idx, 'points', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {q.question_type === 'mcq' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {q.options.map((opt, optIdx) => (
                                                                <div key={optIdx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:border-primary-200 transition-all">
                                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 uppercase">{String.fromCharCode(65 + optIdx)}</div>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder={`Option ${optIdx + 1}`}
                                                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-semibold"
                                                                        value={opt}
                                                                        onChange={e => updateOption(idx, optIdx, e.target.value)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Validation String (Correct Answer)</label>
                                                        <input 
                                                            type="text" 
                                                            className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-4 px-6 text-sm font-bold transition-all outline-none"
                                                            placeholder={q.question_type === 'mcq' ? "Enter the exact correct option text..." : "Expected output or keyword..."}
                                                            value={q.correct_answer}
                                                            onChange={e => updateQuestion(idx, 'correct_answer', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-10 py-8 bg-white border-t border-slate-100 flex items-center justify-between shrink-0 shadow-soft">
                            {currentStep === 0 ? (
                                <>
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(false)} 
                                        className="text-slate-400 hover:text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                                    >
                                        <X size={16} /> Discard
                                    </button>
                                    <div className="flex items-center gap-6">
                                        <Button 
                                            variant="primary" 
                                            className="px-12 py-5 shadow-2xl shadow-primary-600/30 text-base font-black uppercase tracking-tighter disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group" 
                                            form="exam-form" 
                                            type="submit"
                                            disabled={!validateBlueprint()}
                                        >
                                            <Save size={20} className="mr-2 group-hover:scale-110 transition-transform" /> {isEditing ? 'Sync Changes' : 'Construct & Initialize'}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button 
                                        type="button"
                                        onClick={() => setCurrentStep(0)} 
                                        className="text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Parameters
                                    </button>
                                    <Button 
                                        variant="primary" 
                                        className="px-12 py-5 shadow-2xl shadow-primary-600/30 text-base font-black uppercase tracking-tighter" 
                                        onClick={handleSaveQuestions}
                                    >
                                        <CheckCircle2 size={20} className="mr-2" /> Deploy Question Portfolio
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageExams;
