'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { useState, useEffect } from "react";
import { Loader2, Plus, Filter, Download, ArrowUpRight, ArrowDownLeft, Wallet, CheckCircle, Clock, AlertTriangle, RefreshCcw, X, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0, returns: 0, totalSum: 0, paidSum: 0, pendingSum: 0, overdueSum: 0, returnsSum: 0 });

    // Filters
    const [filters, setFilters] = useState({
        period: format(new Date(), 'yyyy-MM'),
        groupId: 'all',
        status: 'all',
        type: 'all'
    });

    // Dropdowns
    const [groups, setGroups] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [formData, setFormData] = useState({
        studentId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        method: 'card', // card, cash, transfer
        type: 'monthly',
        status: 'paid',
        period: format(new Date(), 'yyyy-MM'),
        comment: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchGroups = async () => {
        const res = await fetch('/api/groups');
        const data = await res.json();
        if (data.success) setGroups(data.data);
    };

    // Fetch all students for dropdown (lightweight name+id)
    const fetchStudents = async () => {
        // Optimally this should be searchable or paginated, but for now fetch all
        // We can re-use /api/students but ensuring we get what we need. 
        // Or filter by selected group in modal if generic enough.
        const res = await fetch('/api/students');
        const data = await res.json();
        if (data.success) setStudents(data.data);
    };

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await fetch(`/api/payments?${params}`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.data);
                calculateStats(data.data);
            }
        } catch (e) { console.error(e) }
        finally { setIsLoading(false); }
    };

    const calculateStats = (data: any[]) => {
        const s = {
            total: data.length,
            paid: data.filter((p: any) => p.status === 'paid').length,
            pending: data.filter((p: any) => p.status === 'pending').length,
            overdue: data.filter((p: any) => p.status === 'overdue').length,
            returns: data.filter((p: any) => p.status === 'refunded').length,
            totalSum: data.reduce((acc: number, curr: any) => acc + curr.amount, 0),
            paidSum: data.filter((p: any) => p.status === 'paid').reduce((acc: number, curr: any) => acc + curr.amount, 0),
            pendingSum: data.filter((p: any) => p.status === 'pending').reduce((acc: number, curr: any) => acc + curr.amount, 0),
            overdueSum: data.filter((p: any) => p.status === 'overdue').reduce((acc: number, curr: any) => acc + curr.amount, 0),
            returnsSum: data.filter((p: any) => p.status === 'refunded').reduce((acc: number, curr: any) => acc + curr.amount, 0),
        };
        setStats(s);
    };

    useEffect(() => {
        fetchGroups();
        fetchStudents();
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [filters]);

    const handleCreate = () => {
        setEditingPayment(null);
        setFormData({
            studentId: '',
            amount: 25000,
            date: new Date().toISOString().split('T')[0],
            method: 'card',
            type: 'monthly',
            status: 'paid',
            period: filters.period || format(new Date(), 'yyyy-MM'),
            comment: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (payment: any) => {
        setEditingPayment(payment);
        setFormData({
            studentId: payment.studentId.toString(),
            amount: payment.amount,
            date: new Date(payment.date).toISOString().split('T')[0],
            method: payment.method,
            type: payment.type || 'monthly',
            status: payment.status || 'paid',
            period: payment.period || '',
            comment: payment.comment || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Note: PUT endpoint might not exist yet? I checked api/payments/route.ts earlier (GET/POST).
            // Need to verify if PUT is supported or create generic one.
            // Assuming I might need to update API too if PUT is missing.
            // But for CREATE (POST) it works.

            const url = editingPayment ? `/api/payments/${editingPayment.id}` : '/api/payments';

            const res = await fetch(url, {
                method: editingPayment ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchPayments();
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сети');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to format body
    const editModeParams = (data: any, id?: number) => {
        if (id) return { ...data, id }; // For PUT, API might expect ID in body if reusing same route, or url.
        return data;
    };

    const handleExport = () => {
        const header = ['ID,Студент,Сумма,Статус,Тип,Период,Дата'];
        const csv = payments.map(p =>
            `${p.id},"${p.student?.name}",${p.amount},${p.status},${p.type},"${p.period || '-'}",${p.date}`
        ).join('\n');
        const blob = new Blob([header + '\n' + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header with Export */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="p-2 bg-slate-800 rounded-lg">
                            <Wallet className="w-6 h-6 text-blue-400" />
                        </div>
                        Платежи
                    </h1>
                    <p className="text-slate-400 mt-1 ml-12">Управление платежами студентов</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        Экспорт в Excel
                    </button>
                    <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        Создать платеж
                    </button>
                </div>
            </div>

            {/* Stats Cards Row 1 (Counts) */}
            <div className="grid grid-cols-5 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                    <div className="text-xs text-slate-500 uppercase">Всего платежей</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.paid}</div>
                    <div className="text-xs text-slate-500 uppercase">Оплачено</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                    <div className="text-xs text-slate-500 uppercase">Ожидают оплаты</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
                    <div className="text-xs text-slate-500 uppercase">Просрочено</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{stats.returns}</div>
                    <div className="text-xs text-slate-500 uppercase">Возвраты</div>
                </div>
            </div>

            {/* Stats Cards Row 2 (Sums) */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Wallet className="w-6 h-6" /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase">Общая сумма</div>
                        <div className="text-lg font-bold text-white">{stats.totalSum.toLocaleString()} ₸</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><CheckCircle className="w-6 h-6" /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase">Оплачено</div>
                        <div className="text-lg font-bold text-white">{stats.paidSum.toLocaleString()} ₸</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500"><Clock className="w-6 h-6" /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase">Ожидают</div>
                        <div className="text-lg font-bold text-white">{stats.pendingSum.toLocaleString()} ₸</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><AlertTriangle className="w-6 h-6" /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase">Просрочено</div>
                        <div className="text-lg font-bold text-white">{stats.overdueSum.toLocaleString()} ₸</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><RefreshCcw className="w-6 h-6" /></div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase">Возвраты</div>
                        <div className="text-lg font-bold text-white">{stats.returnsSum.toLocaleString()} ₸</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-slate-500 ml-1">Группа</label>
                    <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={filters.groupId} onChange={e => setFilters({ ...filters, groupId: e.target.value })}>
                        <option value="all">Все группы</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-slate-500 ml-1">Статус</label>
                    <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                        <option value="all">Все статусы</option>
                        <option value="paid">Оплачен</option>
                        <option value="pending">Ожидает оплаты</option>
                        <option value="overdue">Просрочено</option>
                    </select>
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-slate-500 ml-1">Тип платежа</label>
                    <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                        <option value="all">Все типы</option>
                        <option value="monthly">Ежемесячный</option>
                        <option value="one_time">Разовый</option>
                    </select>
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-slate-500 ml-1">Период</label>
                    <input type="month" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" value={filters.period} onChange={e => setFilters({ ...filters, period: e.target.value })} />
                </div>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors h-[38px]">Применить</button>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-800/50 text-xs text-slate-500 uppercase border-b border-slate-800">
                            <th className="p-4">#</th>
                            <th className="p-4">Студент</th>
                            <th className="p-4">Период</th>
                            <th className="p-4">Тип</th>
                            <th className="p-4">Сумма</th>
                            <th className="p-4">Статус</th>
                            <th className="p-4">Создано</th>
                            <th className="p-4">Оплачено</th>
                            <th className="p-4 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={9} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={9} className="p-8 text-center text-slate-500">Нет платежей</td></tr>
                        ) : (
                            payments.map((p, idx) => (
                                <tr key={p.id} className="text-sm hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${p.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                            p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                p.status === 'overdue' ? 'bg-red-500/20 text-red-500' : 'bg-slate-700 text-slate-400'
                                            }`}>{idx + 1}</span>
                                    </td>
                                    <td className="p-4 font-medium text-white">{p.student?.name}</td>
                                    <td className="p-4 text-slate-400 capitalize">{p.period || '-'}</td>
                                    <td className="p-4 text-slate-400">
                                        {p.type === 'monthly' ? 'Ежемесячный' : 'Разовый'}
                                    </td>
                                    <td className="p-4 font-bold text-white">{p.amount.toLocaleString()} ₸</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                            p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                p.status === 'overdue' ? 'bg-red-500/10 text-red-500' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            {p.status === 'paid' ? 'Оплачен' :
                                                p.status === 'pending' ? 'Ожидает оплаты' :
                                                    p.status === 'overdue' ? 'Просрочено' : p.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500">{format(new Date(p.date), 'dd.MM.yyyy')}</td>
                                    <td className="p-4 text-slate-500">
                                        {p.status === 'paid' ? format(new Date(p.date), 'dd.MM.yyyy') : 'Не оплачено'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-400 p-2"><Edit className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden anim-scale-in">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                {editingPayment ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-green-500" />}
                                {editingPayment ? 'Редактировать платеж' : 'Новый платеж'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Студент</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.studentId}
                                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                                >
                                    <option value="">Выберите студента</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Сумма (₸)</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Дата</label>
                                    <input
                                        type="date" required
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Период</label>
                                    <input
                                        type="month" required
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.period}
                                        onChange={e => setFormData({ ...formData, period: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Статус</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="paid">Оплачен</option>
                                        <option value="pending">Ожидает</option>
                                        <option value="overdue">Просрочен</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Тип</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="monthly">Ежемесячный</option>
                                        <option value="one_time">Разовый</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Способ</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.method}
                                        onChange={e => setFormData({ ...formData, method: e.target.value })}
                                    >
                                        <option value="card">Карта</option>
                                        <option value="cash">Наличные</option>
                                        <option value="transfer">Перевод</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors">Отмена</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingPayment ? 'Сохранить' : 'Создать')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
