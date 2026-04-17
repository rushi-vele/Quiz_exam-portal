import React from 'react';
import Editor from '@monaco-editor/react';
import { cn } from '../../utils/cn';
import { Button } from '../common';
import { Play, RotateCcw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import API from '../../api/api';
import { toast } from 'react-hot-toast';

const QuestionCard = ({ question, idx, answer, onAnswerChange, attemptId }) => {
    const { id: questionId, question_text, question_type, options, points } = question;

    const [isRunning, setIsRunning] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [output, setOutput] = React.useState('');
    const [error, setError] = React.useState('');
    const [testInput, setTestInput] = React.useState('');
    const [execTime, setExecTime] = React.useState(null);
    const [selectedLang, setSelectedLang] = React.useState('javascript');
    const [submitResult, setSubmitResult] = React.useState(null);

    // Parse options if it's a JSON string
    const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('');
        setError('');
        setExecTime(null);
        setSubmitResult(null); // Clear previous submission result
        
        try {
            const res = await API.post('/code/run', {
                code: answer || (selectedLang === 'python' ? '# Write your python code here' : '// Write your javascript code here'),
                language: selectedLang,
                input: testInput
            });

            if (res.data.success) {
                setOutput(res.data.output);
                setExecTime(res.data.executionTime);
            } else {
                setError(res.data.error || 'Execution failed without specific trace.');
            }
        } catch (err) {
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Transmission error. Check server status.';
            setError(errMsg);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        setIsSubmitting(true);
        setSubmitResult(null);
        setError('');
        
        try {
            const res = await API.post('/attempts/answers/save', {
                attemptId,
                questionId,
                answer: answer || '',
                language: selectedLang
            });

            if (res.data.success && res.data.evaluation) {
                setSubmitResult(res.data.evaluation);
                toast.success(`Evaluation Complete: ${res.data.evaluation.passedCount}/${res.data.evaluation.totalCount} Passed`);
            } else {
                toast.error('Submission recorded, but logic validation failed.');
            }
        } catch (err) {
            toast.error('Sync failure during submission.');
            setError('Submission sync error. Your code was saved, but real-time validation failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-primary-600 font-bold uppercase tracking-widest text-xs">Question {idx + 1}</span>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 mt-2">
                        {question_text}
                    </h2>
                </div>
                <div className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-bold border border-primary-100 uppercase tracking-wide">
                    {points} Points
                </div>
            </div>

            <div className="min-h-[300px]">
                {question_type === 'mcq' && (
                    <div className="grid gap-4">
                        {parsedOptions.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => onAnswerChange(opt)}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group",
                                    answer === opt 
                                        ? "border-primary-600 bg-primary-50/50" 
                                        : "border-slate-100 hover:border-slate-300 bg-white"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all",
                                    answer === opt 
                                        ? "bg-primary-600 text-white" 
                                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                )}>
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <span className={cn(
                                    "font-medium",
                                    answer === opt ? "text-primary-900" : "text-slate-700"
                                )}>
                                    {opt}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {question_type === 'short_answer' && (
                    <div className="space-y-4">
                        <textarea
                            value={answer || ''}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            className="w-full h-48 bg-white border-2 border-slate-100 rounded-2xl p-6 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none resize-none font-medium placeholder:text-slate-300"
                            placeholder="Type your detailed response here..."
                        ></textarea>
                        <p className="text-xs font-semibold text-slate-400 text-right">Character count: {(answer || '').length}</p>
                    </div>
                )}

                {question_type === 'coding' && (
                    <div className="space-y-4 flex flex-col">
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
                            <AlertTriangle size={16} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Logic Validation: Comments, empty lines, and excessive spaces are automatically ignored during evaluation.</p>
                        </div>
                        <div className="flex flex-col rounded-2xl border-2 border-slate-900 overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={handleRunCode}
                                        disabled={isRunning || isSubmitting}
                                        className="h-9 px-4 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest gap-2"
                                    >
                                        <Play size={14} className={cn(isRunning && "animate-pulse")} />
                                        {isRunning ? 'Executing...' : 'Run Execution'}
                                    </Button>
                                    <Button 
                                        onClick={handleSubmitCode}
                                        disabled={isRunning || isSubmitting}
                                        className="h-9 px-4 bg-primary-600 hover:bg-primary-700 text-white transition-all text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary-500/20"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <CheckCircle size={14} />
                                        )}
                                        {isSubmitting ? 'Evaluating...' : 'Submit Logic'}
                                    </Button>
                                    <select 
                                        className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-slate-600 transition-colors"
                                        value={selectedLang}
                                        onChange={(e) => setSelectedLang(e.target.value)}
                                    >
                                        <option value="javascript">JavaScript (ES6)</option>
                                        <option value="python">Python 3.x</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                                        onClick={() => onAnswerChange('')}
                                    >
                                        <RotateCcw size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Evaluation Results Banner */}
                            {submitResult && (
                                <div className="animate-in slide-in-from-top-4 duration-500">
                                    <div className={cn(
                                        "px-8 py-6 flex items-center justify-between border-b",
                                        submitResult.passed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                                    )}>
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl",
                                                submitResult.passed ? "bg-emerald-500 text-white shadow-emerald-500/40" : "bg-rose-500 text-white shadow-rose-500/40"
                                            )}>
                                                {submitResult.passed ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Assessment Pipeline Verdict</p>
                                                <p className={cn("text-xl font-black uppercase tracking-tight", submitResult.passed ? "text-emerald-600" : "text-rose-600")}>
                                                    {submitResult.passed ? 'PERFECT EXECUTION' : 'LOGICAL DISCREPANCY DETECTED'}
                                                </p>
                                                <p className="text-xs font-bold text-slate-400 mt-1">
                                                    Logic validated: {submitResult.passedCount} of {submitResult.totalCount} scenarios successful.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Test Case Results */}
                                    {submitResult.details && (
                                        <div className="bg-slate-900 overflow-hidden">
                                            <div className="grid grid-cols-1 divide-y divide-slate-800">
                                                {submitResult.details.map((detail, dIdx) => (
                                                    <div key={dIdx} className="p-6 hover:bg-slate-800/50 transition-colors group">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scenario #{dIdx+1}</span>
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                                    detail.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                                                )}>
                                                                    {detail.passed ? 'Matched' : 'Mismatch'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1 h-3 bg-primary-500 rounded-full"></div>
                                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">Input (STDIN)</span>
                                                                </div>
                                                                <code className="block w-full bg-black/40 p-3 rounded-xl border border-white/5 text-[11px] font-mono text-slate-400 break-all">
                                                                    {detail.input || '(None Provided)'}
                                                                </code>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest block ml-1">Expected Signature</span>
                                                                    <code className="block w-full bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/10 text-[11px] font-mono text-emerald-400 break-all">
                                                                        {detail.expected}
                                                                    </code>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <span className={cn(
                                                                        "text-[9px] font-black uppercase tracking-widest block ml-1",
                                                                        detail.passed ? "text-emerald-500/50" : "text-rose-500/50"
                                                                    )}>
                                                                        Captured Output
                                                                    </span>
                                                                    <code className={cn(
                                                                        "block w-full p-2.5 rounded-xl border text-[11px] font-mono break-all",
                                                                        detail.passed 
                                                                            ? "bg-emerald-950/30 border-emerald-500/10 text-emerald-400" 
                                                                            : "bg-rose-950/30 border-rose-500/10 text-rose-400"
                                                                    )}>
                                                                        {detail.error ? `Error: ${detail.error}` : (detail.actual || '(Empty Buffer)')}
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sample Test Cases Header */}
                            {Array.isArray(parsedOptions) && parsedOptions.length > 0 && (
                                <div className="bg-slate-900 border-b border-slate-800 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Public Test Cases</span>
                                        <span className="h-px flex-1 bg-slate-800"></span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {parsedOptions.slice(0, 2).map((tc, i) => (
                                            <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-600">Sample #{i+1}</span>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-[9px] font-black text-primary-500/50 uppercase min-w-[32px] mt-0.5">Input</span>
                                                        <code className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded">{tc.input || '(None)'}</code>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-[9px] font-black text-emerald-500/50 uppercase min-w-[32px] mt-0.5">Expect</span>
                                                        <code className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded">{tc.output}</code>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="h-[400px]">
                                <Editor
                                    height="100%"
                                    language={selectedLang}
                                    value={answer || (selectedLang === 'python' ? '# Write your python code here' : '// Write your javascript code here')}
                                    theme="vs-dark"
                                    onChange={(value) => onAnswerChange(value)}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 20 },
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        roundedSelection: true,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        lineNumbers: 'on',
                                        glyphMargin: false,
                                        folding: true,
                                        lineDecorationsWidth: 10,
                                        lineNumbersMinChars: 3
                                    }}
                                />
                            </div>
                            
                            {/* Test Input Area */}
                            <div className="bg-slate-900 border-t border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2 px-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Test Input (STDIN)</span>
                                </div>
                                <textarea 
                                    className="w-full bg-slate-950 text-slate-300 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:border-slate-600 focus:ring-0 transition-colors outline-none h-20 resize-none"
                                    placeholder="Enter input here (one value per line if needed)..."
                                    value={testInput}
                                    onChange={(e) => setTestInput(e.target.value)}
                                />
                            </div>
                            
                            {/* Terminal Output Section */}
                            {(output || error) && (
                                <div className="bg-[#0F172A] border-t border-slate-800 p-6 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Output</span>
                                            {execTime && (
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.2">
                                                    · Executed in {execTime}ms
                                                </span>
                                            )}
                                        </div>
                                        <button onClick={() => { setOutput(''); setError(''); setExecTime(null); }} className="text-[10px] font-black text-slate-500 uppercase hover:text-slate-300 transition-colors">Terminate View</button>
                                    </div>
                                    <pre className={cn(
                                        "font-mono text-xs p-4 rounded-xl overflow-x-auto custom-scrollbar leading-relaxed",
                                        error ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[inset_0_1px_10px_0_rgba(239,68,68,0.05)]" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_1px_10px_0_rgba(16,185,129,0.05)]"
                                    )}>
                                        {error ? `✖ Stack Trace:\n${error}\n\n[PRO-TIP]: If this was unexpected, check for infinite loops or ensure you provided necessary standard inputs if your code uses input().` : `✔ Standard Out:\n${output}`}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
