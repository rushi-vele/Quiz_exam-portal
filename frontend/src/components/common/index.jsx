import React from 'react';
import { cn } from '../../utils/cn';

export const Button = ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    ...props 
}) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20 active:scale-[0.98]',
        secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98]',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20 active:scale-[0.98]',
        outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]',
        ghost: 'text-slate-600 hover:bg-slate-100',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-base',
    };

    return (
        <button 
            className={cn(
                'rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : children}
        </button>
    );
};

export const Card = ({ children, className, title, subtitle, footer, action }) => (
    <div className={cn('bg-white border border-slate-200/60 rounded-2xl shadow-soft overflow-hidden', className)}>
        {(title || action) && (
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                    {title && <h3 className="text-lg font-bold text-slate-900 leading-none">{title}</h3>}
                    {subtitle && <p className="text-sm font-medium text-slate-500 mt-1.5">{subtitle}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
        )}
        <div className="p-6">
            {children}
        </div>
        {footer && (
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 text-sm">
                {footer}
            </div>
        )}
    </div>
);
