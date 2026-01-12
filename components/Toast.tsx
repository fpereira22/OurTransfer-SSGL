'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: {
        bg: 'from-emerald-500/20 to-emerald-600/10',
        border: 'border-emerald-500/50',
        icon: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
    },
    error: {
        bg: 'from-red-500/20 to-red-600/10',
        border: 'border-red-500/50',
        icon: 'text-red-400',
        glow: 'shadow-red-500/20',
    },
    warning: {
        bg: 'from-amber-500/20 to-amber-600/10',
        border: 'border-amber-500/50',
        icon: 'text-amber-400',
        glow: 'shadow-amber-500/20',
    },
    info: {
        bg: 'from-blue-500/20 to-blue-600/10',
        border: 'border-blue-500/50',
        icon: 'text-blue-400',
        glow: 'shadow-blue-500/20',
    },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [isExiting, setIsExiting] = useState(false);
    const Icon = icons[toast.type];
    const color = colors[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    return (
        <div
            className={`
                relative overflow-hidden
                backdrop-blur-xl bg-gradient-to-r ${color.bg}
                border ${color.border}
                rounded-2xl p-4 pr-12
                shadow-2xl ${color.glow}
                transform transition-all duration-300 ease-out
                ${isExiting
                    ? 'translate-x-full opacity-0 scale-95'
                    : 'translate-x-0 opacity-100 scale-100'
                }
            `}
            style={{
                animation: isExiting ? 'none' : 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            {/* Shimmer effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                    }}
                />
            </div>

            <div className="flex items-start gap-3 relative z-10">
                <div className={`flex-shrink-0 ${color.icon}`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{toast.title}</p>
                    {toast.message && (
                        <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
                    )}
                </div>
            </div>

            <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
                <X size={16} />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden rounded-b-2xl">
                <div
                    className={`h-full ${color.icon.replace('text-', 'bg-')}`}
                    style={{
                        animation: `shrink ${toast.duration || 4000}ms linear forwards`,
                    }}
                />
            </div>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (type: ToastType, title: string, message?: string, duration?: number) => {
        const id = Date.now().toString() + Math.random().toString(36);
        setToasts(prev => [...prev, { id, type, title, message, duration }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const value: ToastContextType = {
        showToast,
        success: (title, message) => showToast('success', title, message),
        error: (title, message) => showToast('error', title, message),
        warning: (title, message) => showToast('warning', title, message),
        info: (title, message) => showToast('info', title, message),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onRemove={removeToast} />
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%) scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0) scale(1);
                        opacity: 1;
                    }
                }
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                @keyframes shimmer {
                    to { transform: translateX(200%); }
                }
            `}</style>
        </ToastContext.Provider>
    );
}
