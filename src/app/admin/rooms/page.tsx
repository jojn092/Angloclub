'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useEffect } from "react";
import { Users, LayoutGrid, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const columns = [
    { key: 'id', label: '#', width: '50px', align: 'center' as const },
    { key: 'name', label: 'Название кабинета' },
    { key: 'capacity', label: 'Вместимость', align: 'center' as const },
];

export default function RoomsPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', capacity: 10 });
    const [isSaving, setIsSaving] = useState(false);

    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleDelete = async (item: any) => {
        if (!confirm('Вы уверены? Удаление кабинета может повлиять на расписание.')) return;
        try {
            await fetch(`/api/rooms/${item.id}`, { method: 'DELETE' });
            fetchRooms();
        } catch (error) {
            alert('Ошибка при удалении');
        }
    };

    const handleEdit = (item: any) => {
        setEditingRoom(item);
        setFormData({ name: item.name, capacity: item.capacity });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingRoom(null);
        setFormData({ name: '', capacity: 10 });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
            const method = editingRoom ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchRooms();
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // derived stats
    const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);

    return (
        <div>
            <PageHeader
                title="Кабинеты"
                description="Управление учебными аудиториями"
            />

            <div className="flex justify-between items-center mb-6">
                {/* Stats */}
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Кабинетов</p>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{rooms.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Вместимость</p>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalCapacity}</h3>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Добавить кабинет
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={rooms}
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
                                {editingRoom ? 'Редактировать кабинет' : 'Новый кабинет'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Название</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Например: Кабинет 101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Вместимость (чел)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
                                    Отмена
                                </button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
