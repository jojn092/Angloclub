import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: LucideIcon;
    variant?: 'default' | 'success' | 'warning' | 'purple' | 'blue';
    className?: string;
}

const variants = {
    default: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300",
    success: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 text-amber-700 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20 text-purple-700 dark:text-purple-400",
    blue: "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 text-blue-700 dark:text-blue-400",
};

const iconVariants = {
    default: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    success: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

export function StatsCard({
    label,
    value,
    subtext,
    icon: Icon,
    variant = 'default',
    className
}: StatsCardProps) {
    return (
        <div className={cn(
            "p-6 rounded-2xl border transition-all duration-200 hover:shadow-md",
            variants[variant],
            className
        )}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                    {subtext && (
                        <p className="text-xs mt-2 opacity-70 font-medium">
                            {subtext}
                        </p>
                    )}
                </div>

                {Icon && (
                    <div className={cn("p-3 rounded-xl", iconVariants[variant])}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </div>
    );
}
