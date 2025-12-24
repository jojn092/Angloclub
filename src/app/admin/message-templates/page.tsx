'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy, Loader2, MessageSquare } from "lucide-react";

export default function MessageTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [form, setForm] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/message-templates');
            const data = await res.json();
            if (data.success) setTemplates(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingItem(null);
        setForm({ title: '', content: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setForm({ title: item.title, content: item.content });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить шаблон?')) return;
        await fetch(`/api/admin/message-templates/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `/api/admin/message-templates/${editingItem.id}`
                : '/api/admin/message-templates';

            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            }
        } catch (error) {
            alert('Ошибка');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Скопировано в буфер обмена');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="Шаблоны сообщений" description="Заготовки для рассылок и уведомлений" />
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Создать шаблон
                </button>
            </div>

            {loading ? <div className="flex justify-center"><Loader2 className="animate-spin" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((t: any) => (
                        <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg dark:text-white">{t.title}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap flex-1 mb-4 h-32 overflow-y-auto">
                                {t.content}
                            </div>

                            <button
                                onClick={() => copyToClipboard(t.content)}
                                className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                            >
                                <Copy className="w-4 h-4" />
                                Копировать текст
                            </button>
                        </div>
                    ))}
                    {templates.length === 0 && <p className="text-slate-400 col-span-full text-center py-10">Нет шаблонов</p>}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">{editingItem ? 'Редактировать' : 'Создать'} шаблон</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Название</label>
                                <input required type="text" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Например: Приветствие" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Текст сообщения</label>
                                <textarea required rows={6} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Введите текст..." />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500">Отмена</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
