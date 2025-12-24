import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PageHeaderProps {
    title: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
    className?: string;
}

export function PageHeader({
    title,
    description,
    actionHref,
    actionLabel,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-8", className)}>
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">{title}</h1>
                {description && (
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm transition-colors">{description}</p>
                )}
            </div>

            {actionHref && actionLabel && (
                <Link
                    href={actionHref}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
