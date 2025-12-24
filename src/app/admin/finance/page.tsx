'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, Loader2, BarChart3, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from "@/components/ui/Card";

export default function FinancePage() {
    const [summary, setSummary] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    // Expense Form
    const [expenseForm, setExpenseForm] = useState({
        amount: '',
        category: 'Rent',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/finance/summary');
            const data = await res.json();
            if (data.success) {
                setSummary(data.data);
            }

            const aRes = await fetch('/api/admin/finance/analytics');
            const aData = await aRes.json();
            if (aData.success) {
                setAnalytics(aData.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseForm)
            });
            if (res.ok) {
                setIsExpenseModalOpen(false);
                setExpenseForm({ amount: '', category: 'Other', description: '', date: format(new Date(), 'yyyy-MM-dd') });
                fetchSummary();
            }
        } catch (error) {
            alert('Error');
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    title="Финансы (ДДС)"
                    description="Движение денежных средств, доходы и расходы"
                />
                <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Добавить расход
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 opacity-90 mb-2">
                        <ArrowUpCircle className="w-5 h-5" />
                        <span className="font-medium">Приход</span>
                    </div>
                    <div className="text-3xl font-bold">{summary?.totalIncome.toLocaleString()} ₸</div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 opacity-90 mb-2">
                        <ArrowDownCircle className="w-5 h-5" />
                        <span className="font-medium">Расход</span>
                    </div>
                    <div className="text-3xl font-bold">{summary?.totalExpense.toLocaleString()} ₸</div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 opacity-90 mb-2">
                        <Wallet className="w-5 h-5" />
                        <span className="font-medium">Чистая прибыль</span>
                    </div>
                    <div className="text-3xl font-bold">{summary?.netProfit.toLocaleString()} ₸</div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="space-y-8">
                {/* 1. Monthly Chart */}
                <Card>
                    <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                        <BarChart3 className="text-blue-600" />
                        Динамика финансов (последние 6 месяцев)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.monthly || []}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar name="Доход" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                <Bar name="Расход" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 2. Group Profitability */}
                <Card>
                    <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" />
                        Прибыльность групп (текущий месяц)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-3 font-semibold">Группа</th>
                                    <th className="p-3 font-semibold">Учитель</th>
                                    <th className="p-3 font-semibold text-right">Студентов</th>
                                    <th className="p-3 font-semibold text-right">Доход</th>
                                    <th className="p-3 font-semibold text-right">Расход (ЗП)</th>
                                    <th className="p-3 font-semibold text-right">Прибыль</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {analytics?.groups.map((g: any) => (
                                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-3 font-medium text-slate-800 dark:text-white">{g.name}</td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400 text-sm">{g.teacherName}</td>
                                        <td className="p-3 text-right text-slate-600 dark:text-slate-400">{g.studentsCount}</td>
                                        <td className="p-3 text-right font-medium text-green-600">+{g.income.toLocaleString()}</td>
                                        <td className="p-3 text-right font-medium text-red-500">-{g.expense.toLocaleString()}</td>
                                        <td className="p-3 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${g.profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {g.profit.toLocaleString()} ₸
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Income List */}
                    <Card>
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <ArrowUpCircle className="text-green-500" />
                            Последние поступления
                        </h3>
                        <div className="space-y-3">
                            {summary?.payments.slice(0, 5).map((p: any) => (
                                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white">{p.student.name}</div>
                                        <div className="text-xs text-slate-500">{format(new Date(p.date), 'dd.MM.yyyy')}</div>
                                    </div>
                                    <div className="font-bold text-green-600">+{p.amount.toLocaleString()} ₸</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Expense List */}
                    <Card>
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <ArrowDownCircle className="text-red-500" />
                            Последние расходы
                        </h3>
                        <div className="space-y-3">
                            {summary?.expenses.slice(0, 5).map((e: any) => (
                                <div key={e.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white">{e.category}</div>
                                        <div className="text-xs text-slate-500">{e.description} • {format(new Date(e.date), 'dd.MM.yyyy')}</div>
                                    </div>
                                    <div className="font-bold text-red-500">-{e.amount.toLocaleString()} ₸</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Expense Modal */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Добавить расход</h2>
                        <form onSubmit={handleCreateExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Сумма</label>
                                <input required type="number" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Категория</label>
                                <select className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                                    <option value="Rent">Аренда</option>
                                    <option value="Salary">Зарплата</option>
                                    <option value="Marketing">Маркетинг</option>
                                    <option value="Office">Офис</option>
                                    <option value="Other">Другое</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Описание</label>
                                <input type="text" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Дата</label>
                                <input type="date" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="flex-1 py-2 text-slate-500">Отмена</button>
                                <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
