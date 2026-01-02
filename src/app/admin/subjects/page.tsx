'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useEffect } from "react";
import { BookOpen, Search, Plus, X, Loader2, Trash2, Edit } from "lucide-react";

// Columns definition for DataTable
const columns = [
    { key: 'id', label: '#', width: '50px', align: 'center' as const },
    { key: 'name', label: 'Название предмета' },
    { key: 'priceFormatted', label: 'Стоимость (мес)' },
    { key: 'groupsCount', label: 'Групп', align: 'center' as const },
];

export default function SubjectsPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', price: 25000 });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/subjects');
            const data = await res.json();
            if (data.success) {
                const formatted = data.data.map((c: any) => ({
                    ...c,
                    priceFormatted: `${c.price.toLocaleString()} ₸`,
                    groupsCount: c._count.groups
                })).filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));
                setCourses(formatted);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [search]);

    const handleDelete = async (item: any) => {
        if (!confirm(`Вы действительно хотите удалить предмет "${item.name}"? Это удалит все связанные группы и расписания.`)) return;

        try {
            const res = await fetch(`/api/subjects/${item.id}`, { method: 'DELETE' });
            const json = await res.json();

            if (res.ok && json.success) {
                fetchCourses();
            } else {
                alert(`Ошибка: ${json.error || 'Не удалось удалить'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сети при удалении');
        }
    };

    const handleEdit = (item: any) => {
        setEditingCourse(item);
        setFormData({ name: item.name, price: item.price });
        setError(null);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingCourse(null);
        setFormData({ name: '', price: 25000 });
        setError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const url = editingCourse ? `/api/subjects/${editingCourse.id}` : '/api/subjects';
            const method = editingCourse ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();

            if (res.ok && json.success) {
                setIsModalOpen(false);
                fetchCourses();
            } else {
                setError(json.error || 'Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
            setError('Ошибка сети');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Предметы"
                description="Управление учебными дисциплинами"
            />

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                {/* Simple Filter */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full md:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Поиск предмета..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 transition-all whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Добавить предмет
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={courses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden anim-scale-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                {editingCourse ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                                {editingCourse ? 'Редактировать предмет' : 'Новый предмет'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">Название предмета</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Например: General English"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">Стоимость за месяц (₸)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₸</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold text-lg"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold transition-all">
                                    Отмена
                                </button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex justify-center items-center">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCourse ? 'Сохранить изменения' : 'Создать предмет')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
