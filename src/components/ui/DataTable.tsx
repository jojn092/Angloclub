import { ChevronLeft, ChevronRight, Edit2, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple interface for visual consistency
interface DataTableProps {
    columns: { key: string; label: string; width?: string; align?: 'left' | 'center' | 'right' }[];
    data: any[];
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    onView?: (item: any) => void;
    className?: string;
}

export function DataTable({ columns, data, onEdit, onDelete, onView, className }: DataTableProps) {
    return (
        <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-200", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn("px-6 py-4 font-semibold", col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left')}
                                    style={{ width: col.width }}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {(onEdit || onDelete || onView) && <th className="px-6 py-4 text-right">Действия</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.length > 0 ? (
                            data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={cn("px-6 py-4 text-slate-700 dark:text-slate-300", col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left')}
                                        >
                                            {item[col.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || onView) && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {onView && (
                                                    <button onClick={() => onView(item)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {onEdit && (
                                                    <button onClick={() => onEdit(item)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button onClick={() => onDelete(item)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                                    Нет данных
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination Placeholder */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Показано {data.length > 0 ? 1 : 0} из {data.length} результатов
                </p>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">1</span>
                    <button className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
