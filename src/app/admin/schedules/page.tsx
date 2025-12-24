'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { useState, useEffect } from "react";
import { Loader2, Plus, X, Calendar as CalendarIcon, List, Clock, Trash2, ChevronLeft, ChevronRight, MapPin, User, BookOpen } from "lucide-react";
import { format, startOfWeek, addDays, getDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getHours, getMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScheduleTemplate {
    id: number;
    groupId: number;
    daysOfWeek: string; // "1,2,3"
    startTime: string;
    endTime: string;
    validFrom: string;
    validTo?: string | null;
    group: {
        name: string;
        teacher?: { name: string };
        course?: { name: string };
        room?: { name: string };
    };
}

const daysMap = [
    { id: 1, label: 'Пн' },
    { id: 2, label: 'Вт' },
    { id: 3, label: 'Ср' },
    { id: 4, label: 'Чт' },
    { id: 5, label: 'Пт' },
    { id: 6, label: 'Сб' },
    { id: 0, label: 'Вс' }
];

export default function SchedulesPage() {
    const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'day' | 'week' | 'month'>('week'); // Default to week as it's visually rich
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        groupId: '',
        daysOfWeek: [] as number[],
        startTime: '09:00',
        endTime: '10:00',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [sRes, gRes] = await Promise.all([
                fetch('/api/schedules'),
                fetch('/api/groups')
            ]);
            const sData = await sRes.json();
            const gData = await gRes.json();

            if (sData.success) setTemplates(sData.data);
            if (gData.success) setGroups(gData.data);
        } catch (e) { console.error(e) }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleDay = (dayId: number) => {
        setFormData(prev => {
            const exists = prev.daysOfWeek.includes(dayId);
            if (exists) return { ...prev, daysOfWeek: prev.daysOfWeek.filter(d => d !== dayId) };
            return { ...prev, daysOfWeek: [...prev.daysOfWeek, dayId] };
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить шаблон?')) return;
        await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (formData.daysOfWeek.length === 0) {
            alert('Выберите хотя бы один день недели');
            setIsSaving(false);
            return;
        }
        try {
            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) { setIsModalOpen(false); fetchData(); }
            else { alert('Ошибка сохранения'); }
        } catch (e) { console.error(e) }
        finally { setIsSaving(false); }
    };

    const getEventColor = (name: string = '') => {
        const colors = [
            'bg-blue-600/20 border-blue-500/50 text-blue-100',
            'bg-purple-600/20 border-purple-500/50 text-purple-100',
            'bg-green-600/20 border-green-500/50 text-green-100',
            'bg-orange-600/20 border-orange-500/50 text-orange-100',
            'bg-pink-600/20 border-pink-500/50 text-pink-100',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    // --- VIEW COMPONENTS ---

    // 1. Table View
    const TableView = () => (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="p-4">#</th>
                        <th className="p-4">Группа</th>
                        <th className="p-4">Предмет</th>
                        <th className="p-4">Преподаватель</th>
                        <th className="p-4">Кабинет</th>
                        <th className="p-4">Дни недели</th>
                        <th className="p-4">Время</th>
                        <th className="p-4">Действие</th>
                        <th className="p-4 text-right">Упр.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {templates.map((t, index) => {
                        const days = t.daysOfWeek ? t.daysOfWeek.split(',').map(Number) : [];
                        return (
                            <tr key={t.id} className="text-sm text-slate-300 hover:bg-slate-800/50 transition-colors">
                                <td className="p-4"><span className="w-6 h-6 flex items-center justify-center rounded bg-purple-500/20 text-purple-400 text-xs font-bold">{index + 1}</span></td>
                                <td className="p-4 font-medium text-white">{t.group?.name}</td>
                                <td className="p-4 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${getEventColor(t.group?.course?.name).includes('blue') ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                    {t.group?.course?.name || '-'}
                                </td>
                                <td className="p-4">{t.group?.teacher?.name || '-'}</td>
                                <td className="p-4">{t.group?.room?.name || 'A101'}</td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        {daysMap.map(d => {
                                            const isActive = days.includes(d.id);
                                            return (
                                                <span key={d.id} className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${isActive ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                                                    {d.label}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </td>
                                <td className="p-4 whitespace-nowrap">{t.startTime} - {t.endTime}</td>
                                <td className="p-4 text-xs text-slate-500">
                                    {t.validTo ? `${new Date(t.validFrom).toLocaleDateString()} - ${new Date(t.validTo).toLocaleDateString()}` : 'Бессрочно'}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-slate-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );

    // 2. Week View
    const WeekView = () => (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="grid grid-cols-8 border-b border-slate-800 bg-slate-800/50">
                <div className="p-3 text-xs text-slate-400 font-medium text-center border-r border-slate-800">Время</div>
                {daysMap.map(d => (
                    <div key={d.id} className="p-3 text-sm text-slate-300 font-medium text-center border-r border-slate-800 last:border-0">{d.label}</div>
                ))}
            </div>
            <div className="h-[600px] overflow-y-auto custom-scrollbar relative">
                {Array.from({ length: 15 }).map((_, i) => {
                    const hour = i + 8; // 8:00 start
                    return (
                        <div key={hour} className="grid grid-cols-8 min-h-[60px] border-b border-slate-800/50">
                            <div className="p-2 text-xs text-slate-500 text-center border-r border-slate-800 relative -top-3">
                                {hour}:00
                            </div>
                            {daysMap.map(d => (
                                <div key={d.id} className="border-r border-slate-800/30 last:border-0 relative">
                                    {templates.filter(t => {
                                        const days = t.daysOfWeek ? t.daysOfWeek.split(',').map(Number) : [];
                                        const startH = parseInt(t.startTime.split(':')[0]);
                                        return days.includes(d.id) && startH === hour;
                                    }).map(t => (
                                        <div key={t.id} className={`absolute top-1 left-1 right-1 p-2 rounded border text-xs overflow-hidden hover:z-10 hover:scale-105 transition-all cursor-pointer group ${getEventColor(t.group?.course?.name)}`}>
                                            <div className="font-bold truncate">{t.group?.name}</div>
                                            <div className="opacity-80 truncate">{t.startTime}-{t.endTime}</div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    );

    // 3. Day View
    const DayView = () => {
        const currentDayId = getDay(currentDate); // 0-6 (Sun-Sat)
        // Adjust for date-fns (Sun=0) vs our map (Sun=0, Mon=1) - matches normally.

        const dayTemplates = templates.filter(t => {
            const days = t.daysOfWeek ? t.daysOfWeek.split(',').map(Number) : [];
            // Fix Sunday mapping if needed. date-fns getDay returns 0 for Sunday. our map has 0 for Sunday.
            return days.includes(currentDayId);
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
            <div className="flex gap-6">
                {/* Timeline */}
                <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentDate(d => addDays(d, -1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white capitalize">{format(currentDate, 'EEEE, d MMMM', { locale: ru })}</div>
                                <div className="text-sm text-slate-500">{dayTemplates.length} занятий запланировано</div>
                            </div>
                            <button onClick={() => setCurrentDate(d => addDays(d, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase">Сегодня</button>
                    </div>

                    <div className="p-6 space-y-4">
                        {dayTemplates.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Нет занятий на этот день</p>
                            </div>
                        ) : (
                            dayTemplates.map(t => (
                                <div key={t.id} className="flex gap-4 group">
                                    <div className="w-16 text-right pt-2 text-sm font-bold text-slate-500">{t.startTime}</div>
                                    <div className="relative flex-1 pb-8 border-l-2 border-slate-800 pl-6 last:border-l-0 last:pb-0">
                                        <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-purple-600 border-4 border-slate-900 shadow-sm"></div>
                                        <div className={`p-4 rounded-xl border bg-slate-800/50 ${getEventColor(t.group?.course?.name)} hover:brightness-110 transition-all`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">{t.group?.course?.name} <span className="text-sm opacity-70 font-normal ml-2">({t.startTime} - {t.endTime})</span></h3>
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-1 rounded bg-black/20 text-xs font-mono">{t.group?.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 text-sm opacity-80">
                                                <div className="flex items-center gap-1"><User className="w-4 h-4" /> {t.group?.teacher?.name || 'Нет учителя'}</div>
                                                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {t.group?.room?.name || 'A101'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Info (optional) */}
                <div className="w-80 space-y-4 hidden xl:block">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-500" /> Загруженность</h4>
                        <div className="flex items-end gap-2 mb-1">
                            <div className="text-3xl font-bold text-white">{dayTemplates.length}</div>
                            <div className="text-sm text-slate-500 mb-1">уроков</div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(dayTemplates.length / 10) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 4. Month View
    const MonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const days = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: monthEnd }); // Show full weeks for grid logic usually, simplified here

        // Simple next/prev month
        const prevMonth = () => setCurrentDate(d => subMonths(d, 1));
        const nextMonth = () => setCurrentDate(d => addMonths(d, 1));

        return (
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b border-slate-800 bg-slate-800/30">
                    <div className="flex items-center gap-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                        <h2 className="text-lg font-bold text-white capitalize">{format(currentDate, 'LLLL yyyy', { locale: ru })}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-slate-800">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                        <div key={d} className="p-2 text-center text-xs font-bold text-slate-500 uppercase border-r border-slate-800 last:border-0">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr">
                    {days.map((day, idx) => {
                        const dayId = getDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        // Find templates valid for this day
                        const dayTemplates = templates.filter(t => {
                            const tDays = t.daysOfWeek ? t.daysOfWeek.split(',').map(Number) : [];
                            return tDays.includes(dayId);
                        });

                        return (
                            <div key={day.toISOString()} className={`min-h-[120px] p-2 border-r border-b border-slate-800 ${!isCurrentMonth ? 'bg-slate-900/50 opacity-50' : ''} hover:bg-slate-800/30 transition-colors`}>
                                <div className={`text-right text-sm font-medium mb-2 ${isSameDay(day, new Date()) ? 'text-purple-400 font-bold' : 'text-slate-500'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {dayTemplates.slice(0, 3).map(t => (
                                        <div key={t.id} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300 truncate">
                                            <span className="text-purple-400 font-bold mr-1">{t.startTime}</span>
                                            {t.group?.name}
                                        </div>
                                    ))}
                                    {dayTemplates.length > 3 && (
                                        <div className="text-[10px] text-slate-500 text-center font-medium">
                                            Еще {dayTemplates.length - 3} ...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Шаблоны расписаний"
                description="Управление регулярными занятиями"
            />

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex gap-1">
                    <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Таблица</button>
                    <button onClick={() => setViewMode('day')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'day' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}>День</button>
                    <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Неделя</button>
                    <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Месяц</button>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/20 transition-all">
                        <Plus className="w-4 h-4" />
                        Создать шаблон
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : (
                <>
                    {viewMode === 'table' && <TableView />}
                    {viewMode === 'week' && <WeekView />}
                    {viewMode === 'day' && <DayView />}
                    {viewMode === 'month' && <MonthView />}
                </>
            )}

            {/* Modal - Purple Theme */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 anim-scale-in">
                        {/* Header */}
                        <div className="bg-purple-600 px-6 py-5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                    <CalendarIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Создать шаблон расписания</h2>
                                    <p className="text-purple-100 text-xs font-medium">Добавление нового правила повторения</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Days of Week Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Дни недели</label>
                                <div className="flex justify-between gap-2">
                                    {daysMap.map(d => {
                                        const isSelected = formData.daysOfWeek.includes(d.id);
                                        return (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => toggleDay(d.id)}
                                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center border ${isSelected
                                                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {d.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Время начала</label>
                                    <input required type="time" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500/50 outline-none" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Время окончания</label>
                                    <input required type="time" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500/50 outline-none" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Действует с</label>
                                    <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500/50 outline-none" value={formData.validFrom} onChange={e => setFormData({ ...formData, validFrom: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1"><span className="text-slate-500 font-normal">(Опционально)</span> Действует до</label>
                                    <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500/50 outline-none" value={formData.validTo} onChange={e => setFormData({ ...formData, validTo: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Группа</label>
                                <select required className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500/50 outline-none" value={formData.groupId} onChange={e => setFormData({ ...formData, groupId: e.target.value })}>
                                    <option value="">Выберите группу</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all">Отмена</button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/20 transition-all">
                                    {isSaving ? '...' : 'Создать шаблон'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
