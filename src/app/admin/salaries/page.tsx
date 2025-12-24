'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";

export default function SalariesPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newRate, setNewRate] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/salaries');
            const data = await res.json();
            if (data.success) setTeachers(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRate = async (id: number) => {
        try {
            await fetch(`/api/admin/users/${id}/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rate: newRate })
            });
            setEditingId(null);
            fetchData();
        } catch (error) {
            alert('Error');
        }
    };

    const columns = [
        { key: 'name', label: 'Преподаватель' },
        {
            key: 'rate',
            label: 'Ставка (час)',
            render: (row: any) => (
                <div className="flex items-center gap-2">
                    {editingId === row.id ? (
                        <div className="flex gap-1">
                            <input
                                type="number"
                                className="w-20 px-2 py-1 border rounded"
                                value={newRate}
                                onChange={e => setNewRate(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => handleUpdateRate(row.id)} className="text-green-600 text-xs font-bold">OK</button>
                            <button onClick={() => setEditingId(null)} className="text-red-500 text-xs">X</button>
                        </div>
                    ) : (
                        <>
                            <span>{row.rate.toLocaleString()} ₸</span>
                            <button onClick={() => { setEditingId(row.id); setNewRate(row.rate.toString()); }} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                <Edit2 className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>
            )
        },
        { key: 'lessons', label: 'Проведено уроков' },
        {
            key: 'total',
            label: 'К выплате',
            render: (row: any) => <span className="font-bold text-green-600">{row.total.toLocaleString()} ₸</span>
        },
    ];

    return (
        <div>
            <PageHeader title="Зарплаты" description="Расчет заработной платы преподавателей" />

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={teachers}
                />
            </div>
        </div>
    );
}
