'use client';

import { StatsCard } from "@/components/ui/StatsCard";
import { Users, GraduationCap, Calendar, CheckCircle, Wallet, AlertCircle, Clock, Loader2, PieChart as PieChartIcon, TrendingUp, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FinanceCharts } from "@/components/admin/analytics/FinanceCharts";
import { PerformanceCharts } from "@/components/admin/analytics/PerformanceCharts";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeGroups: 0,
        lessonsToday: 0,
        unpaidCount: 0,
        totalUnpaidAmount: 0,
        attendance: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'performance'>('overview');

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStats(data.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const OverviewTab = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-3xl shadow-lg shadow-blue-500/20 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Аналитика</h1>
                    <p className="text-blue-100 opacity-90">Обзор ключевых показателей системы</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 border-t border-white/20 pt-8">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold">{stats.totalStudents}</h2>
                            <p className="text-sm font-medium mt-1 text-blue-100 uppercase tracking-wider">Всего студентов</p>
                        </div>
                        <div className="text-center border-l border-r border-white/20">
                            <h2 className="text-4xl font-bold">{stats.activeGroups}</h2>
                            <p className="text-sm font-medium mt-1 text-blue-100 uppercase tracking-wider">Активные группы</p>
                        </div>
                        <div className="text-center">
                            <h2 className="text-4xl font-bold">{stats.attendance}%</h2>
                            <p className="text-sm font-medium mt-1 text-blue-100 uppercase tracking-wider">Посещаемость</p>
                        </div>
                    </div>
                </div>

                {/* Decorative circle */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500/30 blur-2xl"></div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    label="Всего студентов"
                    value={stats.totalStudents.toString()}
                    subtext={`Активных: ${stats.totalStudents}`}
                    icon={Users}
                    variant="blue"
                />
                <StatsCard
                    label="Группы"
                    value={stats.activeGroups.toString()}
                    subtext={`Активных: ${stats.activeGroups}`}
                    icon={GraduationCap}
                    variant="success"
                />
                <StatsCard
                    label="Уроки сегодня"
                    value={stats.lessonsToday.toString()}
                    subtext="По расписанию"
                    icon={Calendar}
                    variant="purple"
                />

                <StatsCard
                    label="Посещаемость"
                    value={`${stats.attendance}%`}
                    icon={CheckCircle}
                    variant="success"
                />
                <StatsCard
                    label="Неоплаченные"
                    value={stats.unpaidCount.toString()}
                    subtext={`Общий долг: ${stats.totalUnpaidAmount}₸`}
                    icon={Wallet}
                    variant="warning"
                />
                <StatsCard
                    label="Пробный период"
                    value="0"
                    icon={Clock}
                    variant="warning"
                />
            </div>

            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
                Последнее обновление: {format(new Date(), 'dd.MM.yyyy, HH:mm:ss')}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center md:justify-start overflow-x-auto pb-2 md:pb-0">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Обзор
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'finance' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Финансы
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'performance' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        <PieChartIcon className="w-4 h-4" />
                        Показатели
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'finance' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><FinanceCharts /></div>}
            {activeTab === 'performance' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><PerformanceCharts /></div>}
        </div>
    );
}
