'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useEffect } from "react";
import { FileText, Plus, Loader2, X } from "lucide-react";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const columns = [
    { key: 'title', label: 'Тема' },
    { key: 'courseName', label: 'Предмет' },
    { key: 'deadlineFormatted', label: 'Дедлайн' },
    { key: 'createdAtFormatted', label: 'Создано' },
];

export default function HomeworkPage() {
    const [homework, setHomework] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', courseId: '', deadline: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [hRes, cRes] = await Promise.all([
                fetch('/api/homework'),
                fetch('/api/subjects')
            ]);
            const hData = await hRes.json();
            const cData = await cRes.json();

            if (hData.success) {
                setHomework(hData.data.map((h: any) => ({
                    ...h,
                    courseName: h.course?.name || '-',
                    deadlineFormatted: h.deadline ? format(new Date(h.deadline), 'dd MMM yyyy', { locale: ru }) : 'Нет срока',
                    createdAtFormatted: format(new Date(h.createdAt), 'dd.MM', { locale: ru })
                })));
            }
            if (cData.success) setCourses(cData.data);
        } catch (e) { console.error(e) }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/homework', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) { setIsModalOpen(false); fetchData(); }
        } catch (e) { } finally { setIsSaving(false); }
    };

    return (
        <div>
            <PageHeader title="Домашнее задание" description="Управление заданиями для групп" />

            <div className="flex justify-end mb-6">
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">
                    <Plus className="w-4 h-4" /> Создать задание
                </button>
            </div>

            {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /> : <DataTable columns={columns} data={homework} />}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Новое задание</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Название</label>
                                <input required className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Предмет</label>
                                <select required className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })}>
                                    <option value="">Выбрать предмет</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Дедлайн</label>
                                <input type="date" className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                            </div>
                            <button type="submit" disabled={isSaving} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isSaving ? '...' : 'Создать'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
