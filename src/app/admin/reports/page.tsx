'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { Download, FileText, Users, CreditCard, Calendar, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { run } from 'node:test';

export default function ReportsPage() {
    const [stats, setStats] = useState({
        students: 0,
        groups: 0,
        income: 0,
        activeSchedules: 0
    });

    useEffect(() => {
        fetch('/api/reports')
            .then(res => res.json())
            .then(res => {
                if (res.success) setStats(res.data);
            });
    }, []);

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || !data.length) {
            alert('Нет данных для экспорта');
            return;
        }

        // Dynamic headers based on keys of first object
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                let val = row[fieldName];
                if (typeof val === 'string') {
                    // escape quotes
                    val = `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async (type: string) => {
        let endpoint = '';
        let transform = (d: any) => d;

        switch (type) {
            case 'users':
                endpoint = '/api/students';
                transform = (data: any[]) => data.map(s => ({
                    ID: s.id,
                    Имя: s.name,
                    Телефон: s.phone,
                    Баланс: s.balance,
                    Скидка: s.discount
                }));
                break;
            case 'groups':
                endpoint = '/api/groups';
                transform = (data: any[]) => data.map(g => ({
                    ID: g.id,
                    Название: g.name,
                    Предмет: g.course?.name || '-',
                    Учитель: g.teacher?.name || '-',
                    Кабинет: g.room?.name || '-'
                }));
                break;
            case 'payments':
                endpoint = '/api/payments';
                transform = (data: any[]) => data.map(p => ({
                    ID: p.id,
                    Сумма: p.amount,
                    Дата: new Date(p.date).toLocaleDateString(),
                    Студент: p.student?.name || '-',
                    Метод: p.method,
                    Тип: p.type || '-',
                    Статус: p.status || '-',
                    Период: p.period || '-'
                }));
                break;
            case 'attendance':
                // Removed alert. Using ?all=true to fetch everything.
                endpoint = '/api/attendance?all=true';
                transform = (data: any[]) => {
                    const flat: any[] = [];
                    data.forEach((l: any) => {
                        l.attendance.forEach((a: any) => {
                            flat.push({
                                Дата: new Date(l.date).toLocaleDateString(),
                                Группа: l.group?.name || '-',
                                Студент: a.student?.name || '-',
                                Статус: a.status
                            });
                        });
                    });
                    return flat;
                };
                break;
            case 'schedules':
                endpoint = '/api/schedules';
                transform = (data: any[]) => data.map(s => ({
                    ID: s.id,
                    Группа: s.group?.name,
                    Дни: s.daysOfWeek || '-',
                    Время: `${s.startTime}-${s.endTime}`,
                    Действует_С: s.validFrom,
                    Действует_До: s.validTo || 'Бессрочно'
                }));
                break;
        }

        try {
            const res = await fetch(endpoint);
            const json = await res.json();
            if (json.success) {
                const data = transform(json.data);
                downloadCSV(data, type);
            } else {
                alert('Ошибка экспорта');
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка сети');
        }
    };

    const cards = [
        { id: 'users', title: 'Студенты', count: stats.students, icon: Users, color: 'bg-blue-500' },
        { id: 'groups', title: 'Группы', count: stats.groups, icon: Users, color: 'bg-green-500' },
        { id: 'payments', title: 'Платежи', count: `${stats.income} ₸`, icon: CreditCard, color: 'bg-emerald-500' },
        { id: 'attendance', title: 'Посещаемость', count: 'Excel', icon: Calendar, color: 'bg-orange-500' },
        { id: 'schedules', title: 'Расписание', count: stats.activeSchedules, icon: BookOpen, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Отчеты" description="Экспорт данных в Excel (CSV)" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(card => (
                    <div key={card.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.color} bg-opacity-20 text-white`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => handleExport(card.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors uppercase tracking-wider"
                            >
                                <Download className="w-3 h-3" /> Excel
                            </button>
                        </div>
                        <div>
                            <h3 className="text-slate-400 font-medium text-sm mb-1">{card.title}</h3>
                            <div className="text-2xl font-bold text-white">{card.count}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hint */}
            <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 text-center text-sm text-slate-500">
                <p>Все отчеты скачиваются в формате <b>.csv</b>. Вы можете открыть их в Excel.</p>
            </div>
        </div>
    );
}
