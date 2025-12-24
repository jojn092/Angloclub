'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useEffect } from "react";
import { Library, Plus, Loader2, X, ExternalLink } from "lucide-react";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const columns = [
    { key: 'title', label: 'Название' },
    { key: 'type', label: 'Тип' },
    { key: 'courseName', label: 'Предмет' },
    { key: 'actions', label: 'Ссылка', align: 'right' as const },
];

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', type: 'PDF', url: '', courseId: '' });
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [mRes, cRes] = await Promise.all([
                fetch('/api/materials'),
                fetch('/api/subjects')
            ]);
            const mData = await mRes.json();
            const cData = await cRes.json();

            if (mData.success) {
                setMaterials(mData.data.map((m: any) => ({
                    ...m,
                    courseName: m.course?.name || '-',
                    actions: <a href={m.url} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1 justify-end"><ExternalLink className="w-4 h-4" /> Открыть</a>
                })));
            }
            if (cData.success) setCourses(cData.data);
        } catch (e) { } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) { setIsModalOpen(false); fetchData(); }
        } catch (e) { } finally { setIsSaving(false); }
    };

    return (
        <div>
            <PageHeader title="Учебные материалы" description="База знаний и ресурсы" />

            <div className="flex justify-end mb-6">
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">
                    <Plus className="w-4 h-4" /> Добавить материал
                </button>
            </div>

            {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /> : <DataTable columns={columns} data={materials} />}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Новый материал</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Название</label>
                                <input required className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Тип</label>
                                <select className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option>PDF</option>
                                    <option>Video</option>
                                    <option>Link</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Ссылка / URL</label>
                                <input required className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Предмет</label>
                                <select required className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })}>
                                    <option value="">Выбрать предмет</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" disabled={isSaving} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isSaving ? '...' : 'Добавить'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
