import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { 
    Upload, 
    Plus, 
    FileSpreadsheet, 
    Trash2, 
    PlusCircle,
    CheckCircle2,
    Code2,
    ListTodo,
    AlertCircle,
    X,
    FileCheck
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import { toast } from 'react-hot-toast';

const QuestionUpload = () => {
    const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'bulk'
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [manualQuestions, setManualQuestions] = useState([
        { id: Date.now(), question_text: '', question_type: 'mcq', points: 5, options: ['', '', '', ''], correct_answer: '' }
    ]);
    
    const [bulkQuestions, setBulkQuestions] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await API.get('/exams');
                setExams(res.data);
                if (res.data.length > 0) setSelectedExam(res.data[0].id);
            } catch (err) {
                toast.error('Failed to load exams');
            }
        };
        fetchExams();
    }, []);

    const addManualQuestion = () => {
        setManualQuestions([...manualQuestions, { 
            id: Date.now(), 
            question_text: '', 
            question_type: 'mcq', 
            points: 5, 
            options: ['', '', '', ''], 
            correct_answer: '' 
        }]);
    };

    const removeManualQuestion = (id) => {
        if (manualQuestions.length === 1) return;
        setManualQuestions(manualQuestions.filter(q => q.id !== id));
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Restriction: Only CSV and Excel (No PDF)
        const allowedExtensions = ['csv', 'xlsx', 'xls'];
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(extension)) {
            toast.error(`"${extension}" files are not supported. Please use CSV or Excel.`);
            e.target.value = ''; // Reset input
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsParsing(true);
        const loadingToast = toast.loading(`Analysing ${file.name}...`);

        try {
            const res = await API.post('/questions/parse', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });
            setBulkQuestions(res.data);
            toast.success('File parsed successfully! Review core logic below.', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to parse file', { id: loadingToast });
        } finally {
            setIsParsing(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!selectedExam) return toast.error('Please select an exam first');
        
        setIsSubmitting(true);
        try {
            await API.post('/questions/add', {
                examId: selectedExam,
                questions: manualQuestions
            });
            toast.success('Questions saved successfully');
            setManualQuestions([{ id: Date.now(), question_text: '', question_type: 'mcq', points: 5, options: ['', '', '', ''], correct_answer: '' }]);
        } catch (err) {
            toast.error('Failed to save questions');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkSubmit = async () => {
        if (!selectedExam) return toast.error('Please select an exam first');
        if (bulkQuestions.length === 0) return toast.error('No questions to upload');
        
        const invalidCount = bulkQuestions.filter(q => q.error).length;
        if (invalidCount > 0) return toast.error(`Please fix ${invalidCount} validation errors first`);

        setIsSubmitting(true);
        try {
            await API.post('/questions/add', {
                examId: selectedExam,
                questions: bulkQuestions
            });
            toast.success(`${bulkQuestions.length} Questions imported successfully`);
            setBulkQuestions([]);
        } catch (err) {
            toast.error('Failed to import questions');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Question Curator</h1>
                    <p className="text-slate-500 font-medium mt-1">Populate your exam with diverse question types.</p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[300px]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Assessment</label>
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        <select 
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                            className="flex-1 bg-transparent px-4 py-2 text-sm font-bold text-slate-700 outline-none"
                        >
                            <option value="">Choose an exam...</option>
                            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200">
                    <button 
                        onClick={() => setUploadMode('manual')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${uploadMode === 'manual' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Manual Entry
                    </button>
                    <button 
                        onClick={() => setUploadMode('bulk')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${uploadMode === 'bulk' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Bulk Import
                    </button>
                </div>
            </div>

            {uploadMode === 'manual' ? (
                <div className="space-y-6">
                    {manualQuestions.map((q, idx) => (
                        <Card key={q.id} className="relative group overflow-visible border-slate-200 hover:border-slate-300 transition-all p-8">
                            <div className="absolute -left-3 top-8 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl z-10 transition-transform group-hover:scale-110">
                                {idx + 1}
                            </div>
                            
                            <div className="flex justify-between items-start mb-8 pl-6">
                                <div className="flex gap-4">
                                    <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 border border-slate-100">
                                        {q.question_type === 'mcq' ? <ListTodo size={22} /> : q.question_type === 'coding' ? <Code2 size={22} /> : <AlertCircle size={22} />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interaction Model</p>
                                        <select 
                                            value={q.question_type}
                                            onChange={(e) => {
                                                const newQ = [...manualQuestions];
                                                newQ[idx].question_type = e.target.value;
                                                setManualQuestions(newQ);
                                            }}
                                            className="bg-transparent text-sm font-black text-slate-900 outline-none"
                                        >
                                            <option value="mcq">Multiple Choice</option>
                                            <option value="coding">Coding Challenge</option>
                                            <option value="short_answer">Short Answer</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Weightage</p>
                                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                            <input 
                                                type="number" 
                                                value={q.points} 
                                                onChange={(e) => {
                                                    const newQ = [...manualQuestions];
                                                    newQ[idx].points = parseInt(e.target.value) || 0;
                                                    setManualQuestions(newQ);
                                                }}
                                                className="w-10 bg-transparent text-sm font-black text-slate-900 outline-none text-center" 
                                            />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pts</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeManualQuestion(q.id)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8 pl-6">
                                <textarea 
                                    className="w-full text-2xl font-black text-slate-900 placeholder:text-slate-100 border-none px-0 focus:ring-0 resize-none min-h-[80px]"
                                    placeholder="Enter your query prompt..."
                                    value={q.question_text}
                                    onChange={(e) => {
                                        const newQ = [...manualQuestions];
                                        newQ[idx].question_text = e.target.value;
                                        setManualQuestions(newQ);
                                    }}
                                />
                                
                                {q.question_type === 'mcq' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-4 group/opt">
                                                <button 
                                                    onClick={() => {
                                                        const newQ = [...manualQuestions];
                                                        newQ[idx].correct_answer = opt;
                                                        setManualQuestions(newQ);
                                                    }}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all border-2 ${q.correct_answer === opt && opt !== '' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-transparent text-slate-400 group-focus-within/opt:bg-slate-100 group-focus-within/opt:text-slate-900'}`}
                                                >
                                                    {String.fromCharCode(65 + oIdx)}
                                                </button>
                                                <input 
                                                    className="flex-1 bg-slate-50/50 border-2 border-transparent focus:border-slate-200 focus:bg-white rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-700 transition-all outline-none"
                                                    placeholder={`Option ${oIdx + 1} content`}
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newQ = [...manualQuestions];
                                                        newQ[idx].options[oIdx] = e.target.value;
                                                        setManualQuestions(newQ);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(q.question_type === 'short_answer' || q.question_type === 'coding') && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Benchmark Solution</p>
                                        <textarea 
                                            className="w-full bg-slate-900 text-slate-100 p-6 rounded-3xl font-mono text-sm border-none focus:ring-2 focus:ring-primary-500/50 min-h-[120px]"
                                            placeholder={q.question_type === 'coding' ? "Provide valid code reference..." : "Provide model answer..."}
                                            value={q.correct_answer}
                                            onChange={(e) => {
                                                const newQ = [...manualQuestions];
                                                newQ[idx].correct_answer = e.target.value;
                                                setManualQuestions(newQ);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}

                    <div className="flex justify-center pt-8">
                        <button 
                            onClick={addManualQuestion}
                            className="flex items-center gap-4 px-10 py-5 rounded-3xl border-3 border-dashed border-slate-200 text-slate-400 font-black tracking-widest uppercase text-xs hover:border-slate-300 hover:text-slate-900 transition-all active:scale-95 bg-slate-50/30 hover:bg-white"
                        >
                            <PlusCircle size={20} /> Add Assessment Variable
                        </button>
                    </div>

                    <div className="sticky bottom-8 z-20 flex justify-end">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="shadow-2xl shadow-slate-900/10 px-12 py-7 h-auto rounded-3xl text-sm tracking-widest font-black uppercase"
                            onClick={handleManualSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Syncing Portfolio...' : 'Commit Assessment Grid'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {bulkQuestions.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center py-24 border-3 border-dashed border-slate-100 bg-slate-50/30 rounded-[40px]">
                            <div className="w-24 h-24 bg-white text-slate-900 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-slate-200 border border-slate-50">
                                <FileSpreadsheet size={42} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Rapid Ingestion Hub</h3>
                            <p className="text-slate-500 font-medium mt-3 max-w-sm text-center">
                                Upload assessment data in bulk directly from your source files. Ensure consistency with the standard assessment protocol.
                            </p>
                            
                            <div className="mt-12 relative group">
                                <input 
                                    type="file" 
                                    accept=".csv, .xlsx, .xls"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={handleFileSelect}
                                    disabled={isParsing}
                                />
                                <Button variant="primary" size="lg" className="px-12 py-5 h-auto rounded-3xl text-sm font-black uppercase tracking-widest shadow-xl group-hover:scale-110 transition-all bg-slate-900 pointer-events-none">
                                    <Upload size={20} className="mr-3" /> Execute Data Feed
                                </Button>
                            </div>

                            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-3xl border-t border-slate-100 pt-16">
                                <div className="text-center group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 font-black transition-all group-hover:bg-slate-900 group-hover:text-white">1</div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Configure</p>
                                    <p className="text-xs font-medium text-slate-400 leading-relaxed px-4">Map spreadsheet columns to system variables</p>
                                </div>
                                <div className="text-center group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 font-black transition-all group-hover:bg-slate-900 group-hover:text-white">2</div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Simulate</p>
                                    <p className="text-xs font-medium text-slate-400 leading-relaxed px-4">Preview ingestion results for verification</p>
                                </div>
                                <div className="text-center group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 font-black transition-all group-hover:bg-slate-900 group-hover:text-white">3</div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Migrate</p>
                                    <p className="text-xs font-medium text-slate-400 leading-relaxed px-4">Deploy mapped data to production exam</p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white shadow-2xl">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <FileCheck size={24} />
                                    </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Assessment Simulation Mode</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-medium text-white/50">{bulkQuestions.length} Records extracted</p>
                                        {bulkQuestions.filter(q => q.error).length > 0 && (
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded-md border border-red-500/30 flex items-center gap-1">
                                                <AlertCircle size={10} /> {bulkQuestions.filter(q => q.error).length} ERRORS
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setBulkQuestions([])}
                                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                >
                                    Discard
                                </button>
                                <Button 
                                    variant="primary" 
                                    className={cn(
                                        "px-8 border-none",
                                        bulkQuestions.some(q => q.error) ? "bg-slate-700 cursor-not-allowed opacity-50" : "bg-emerald-500 hover:bg-emerald-600"
                                    )}
                                    onClick={handleBulkSubmit}
                                    loading={isSubmitting}
                                    disabled={bulkQuestions.some(q => q.error)}
                                >
                                    Deploy {bulkQuestions.length} Records
                                </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {bulkQuestions.map((q, idx) => (
                                    <div key={idx} className={cn(
                                        "p-6 bg-white rounded-[24px] border-2 transition-all flex items-start gap-6",
                                        q.error ? "border-red-100 bg-red-50/30" : "border-slate-100 hover:border-slate-200 shadow-sm"
                                    )}>
                                        <div className="flex-none w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-xs">
                                            {q.row_number}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-bold text-slate-900 decoration-slate-200">{q.question_text}</h4>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded-lg">{q.question_type}</span>
                                                    <span className="px-3 py-1 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded-lg">{q.points} Pts</span>
                                                </div>
                                            </div>
                                            
                                            {q.options && q.options.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {q.options.map((opt, oIdx) => (
                                                        <span key={oIdx} className={cn(
                                                            "px-3 py-1.5 rounded-xl text-[10px] font-bold border",
                                                            opt === q.correct_answer ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-500"
                                                        )}>
                                                            {opt}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {(!q.options || q.options.length === 0) && (
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-mono text-slate-500 truncate">
                                                    Benchmark: {q.correct_answer}
                                                </div>
                                            )}

                                            {q.error && (
                                                <div className="flex items-center gap-2 text-red-500">
                                                    <AlertCircle size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{q.error}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => setBulkQuestions(bulkQuestions.filter((_, i) => i !== idx))}
                                            className="text-slate-200 hover:text-red-500 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default QuestionUpload;
