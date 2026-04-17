import React from 'react';
import { cn } from '../../utils/cn';

const QuestionPalette = ({ questions, currentIdx, answers, onSelect }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-fit sticky top-28">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                Question Palette
            </h3>
            <div className="grid grid-cols-5 gap-3">
                {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentIdx;
                    
                    return (
                        <button
                            key={q.id}
                            onClick={() => onSelect(idx)}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 border-2",
                                isCurrent && "border-primary-600 scale-110 shadow-lg shadow-primary-600/10 z-10",
                                !isCurrent && "border-transparent",
                                isAnswered 
                                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/20" 
                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-primary-600"></span>
                    <span>Answered</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-slate-100"></span>
                    <span>Not Visited</span>
                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;
