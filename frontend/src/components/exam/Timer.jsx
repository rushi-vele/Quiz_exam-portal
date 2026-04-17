import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const Timer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const isLowTime = timeLeft < 120; // 2 minutes

    return (
        <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all duration-300",
            isLowTime 
                ? "bg-red-50 border-red-200 text-red-600 animate-pulse shadow-lg shadow-red-500/10" 
                : "bg-slate-900 border-slate-800 text-white"
        )}>
            {isLowTime ? <AlertCircle size={20} /> : <Clock size={20} />}
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 leading-none mb-0.5">Time Remaining</span>
                <span className="text-xl font-mono font-bold leading-none">{formatTime(timeLeft)}</span>
            </div>
        </div>
    );
};

export default Timer;
