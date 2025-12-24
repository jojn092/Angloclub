'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useEffect } from "react";
import { Search, Filter, Loader2, Plus, X } from "lucide-react";

interface Student {
    id: number;
    name: string;
    phone: string;
    email?: string;
    balance: number;
    status: string;
    groups: { name: string }[];
}

// Columns definition for DataTable
const columns = [
    { key: 'id', label: '#', width: '50px', align: 'center' as const },
    { key: 'name', label: 'ФИО Студента' },
    { key: 'phone', label: 'Контакты' },
    { key: 'groupList', label: 'Группы' },
    { key: 'balanceFormatted', label: 'Баланс' },
    { key: 'statusTranslated', label: 'Статус' },
];

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', motherPhone: '', fatherPhone: '', balance: 0, status: 'active' });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch data from API
    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const res = await fetch(`/api/students?${params}`);
            const data = await res.json();

            if (data.success) {
                // Transform data for DataTable
                const formattedData = data.data.map((s: Student) => ({
                    ...s,
                    groupList: s.groups.map(g => g.name).join(', ') || '-',
                    balanceFormatted: `${s.balance.toLocaleString()} ₸`,
                    statusTranslated: s.status === 'active' ? 'Активен' : 'Неактивен'
                }));
                setStudents(formattedData);
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleCreate = () => {
        setEditingStudent(null);
        setFormData({ name: '', phone: '', email: '', motherPhone: '', fatherPhone: '', balance: 0, status: 'active' });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingStudent(item);
        setFormData({
            name: item.name,
            phone: item.phone,
            email: item.email || '',
            motherPhone: item.motherPhone || '',
            fatherPhone: item.fatherPhone || '',
            balance: item.balance,
            status: item.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены, что хотите удалить этого студента?')) return;
        try {
            const res = await fetch(`/api/students/${item.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStudents(); // Refresh list
            } else {
                alert('Ошибка при удалении');
            }
        } catch (error) {
            console.error('Delete error', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
            const method = editingStudent ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchStudents();
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Пользователи"
                description="Управление студентами и преподавателями"
            />

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по имени или телефону..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 transition-all whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Добавить студента
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={students}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                {editingStudent ? 'Редактировать студента' : 'Новый студент'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ФИО</label>
                                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Телефон</label>
                                <input required type="tel" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Тел. Отца</label>
                                    <input type="tel" placeholder="+7..." className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" value={formData.fatherPhone} onChange={e => setFormData({ ...formData, fatherPhone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Тел. Матери</label>
                                    <input type="tel" placeholder="+7..." className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" value={formData.motherPhone} onChange={e => setFormData({ ...formData, motherPhone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Баланс (₸)</label>
                                <input type="number" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" value={formData.balance} onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Статус</label>
                                <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="active">Активен</option>
                                    <option value="inactive">Неактивен</option>
                                    <option value="graduated">Выпустился</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">Отмена</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{isSaving ? '...' : 'Сохранить'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
