'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2, Plus, Calendar as CalendarIcon, Filter, Users, User, MapPin, BookOpen, List, AlignJustify, X } from "lucide-react";
import { startOfWeek, addDays, format, parseISO, isSameDay, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

const timeSlots = Array.from({ length: 14 }).map((_, i) => `${i + 8}:00`); // 08:00 to 21:00

const getEventColor = (subjectName: string = '') => {
    const colors = [
        'bg-blue-600/20 border-blue-500/50 text-blue-100',
        'bg-purple-600/20 border-purple-500/50 text-purple-100',
        'bg-orange-600/20 border-orange-500/50 text-orange-100',
        'bg-green-600/20 border-green-500/50 text-green-100',
        'bg-pink-600/20 border-pink-500/50 text-pink-100',
    ];
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

export default function LessonsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [lessons, setLessons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

    // Filters
    const [filters, setFilters] = useState({
        groupId: 'all',
        teacherId: 'all',
        roomId: 'all',
        subjectName: 'all'
    });

    // Dropdown Data
    const [groups, setGroups] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        groupId: '',
        duration: 60,
        topic: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const fetchDependencies = async () => {
        try {
            const [g, t, r, s] = await Promise.all([
                fetch('/api/groups').then(res => res.json()),
                fetch('/api/teachers').then(res => res.json()),
                fetch('/api/rooms').then(res => res.json()),
                fetch('/api/subjects').then(res => res.json())
            ]);
            if (g.success) setGroups(g.data);
            if (t.success) setTeachers(t.data);
            if (r.success) setRooms(r.data);
            if (s.success) setSubjects(s.data);
        } catch (e) { console.error(e); }
    };

    const fetchLessons = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                date: currentDate.toISOString(),
                view: viewMode,
                ...(filters.groupId !== 'all' && { groupId: filters.groupId }),
                ...(filters.teacherId !== 'all' && { teacherId: filters.teacherId }),
                ...(filters.roomId !== 'all' && { roomId: filters.roomId }),
            });
            const res = await fetch(`/api/lessons?${params}`);
            const data = await res.json();
            if (data.success) {
                setLessons(data.data);
            }
        } catch (e) { console.error(e) }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchDependencies();
    }, []);

    useEffect(() => {
        fetchLessons();
    }, [currentDate, filters, viewMode]);

    const changeDate = (direction: 'prev' | 'next') => {
        if (viewMode === 'week') setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
        if (viewMode === 'day') setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
        if (viewMode === 'month') setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    const handleCreate = () => {
        setFormData({
            date: format(currentDate, 'yyyy-MM-dd'),
            time: '09:00',
            groupId: groups.length > 0 ? groups[0].id : '',
            duration: 60,
            topic: ''
        });
        setIsModalOpen(true);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Construct full datetime
            const fullDate = new Date(`${formData.date}T${formData.time}:00`);

            const res = await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: formData.groupId,
                    date: fullDate.toISOString(),
                    duration: Number(formData.duration),
                    topic: formData.topic
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchLessons();
            } else {
                alert('Ошибка создания');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Stats
    const totalLessons = lessons.length;
    const activeDays = new Set(lessons.map(l => format(new Date(l.date), 'yyyy-MM-dd'))).size;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="bg-purple-600 rounded-xl p-6 text-white shadow-lg shadow-purple-900/20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><CalendarIcon className="w-6 h-6" /></div>
                            Расписание занятий
                        </h1>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                    <div className="text-center border-r border-white/10 last:border-0"><div className="text-3xl font-bold">{totalLessons}</div><div className="text-xs text-purple-200 uppercase tracking-wider mt-1">Всего занятий</div></div>
                    <div className="text-center border-r border-white/10 last:border-0"><div className="text-3xl font-bold capitalize">{format(new Date(), 'EEEE', { locale: ru })}</div><div className="text-xs text-purple-200 uppercase tracking-wider mt-1">Сегодня</div></div>
                    <div className="text-center"><div className="text-3xl font-bold">{activeDays}</div><div className="text-xs text-purple-200 uppercase tracking-wider mt-1">Активных дней</div></div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Filters */}
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 ml-1">Группа</label><div className="relative"><Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" /><select className="w-full pl-9 pr-4 py-2 bg-slate-800 border-slate-700 text-slate-200 rounded-lg text-sm" value={filters.groupId} onChange={e => setFilters({ ...filters, groupId: e.target.value })}><option value="all">Все группы</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 ml-1">Преподаватель</label><div className="relative"><User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" /><select className="w-full pl-9 pr-4 py-2 bg-slate-800 border-slate-700 text-slate-200 rounded-lg text-sm" value={filters.teacherId} onChange={e => setFilters({ ...filters, teacherId: e.target.value })}><option value="all">Все преподаватели</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 ml-1">Кабинет</label><div className="relative"><MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" /><select className="w-full pl-9 pr-4 py-2 bg-slate-800 border-slate-700 text-slate-200 rounded-lg text-sm" value={filters.roomId} onChange={e => setFilters({ ...filters, roomId: e.target.value })}><option value="all">Все кабинеты</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div></div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 ml-1">Вид</label>
                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <button onClick={() => setViewMode('day')} className={`flex-1 py-1.5 text-xs font-medium transition-all rounded-md ${viewMode === 'day' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>День</button>
                            <button onClick={() => setViewMode('week')} className={`flex-1 py-1.5 text-xs font-medium transition-all rounded-md ${viewMode === 'week' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Неделя</button>
                            <button onClick={() => setViewMode('month')} className={`flex-1 py-1.5 text-xs font-medium transition-all rounded-md ${viewMode === 'month' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Месяц</button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end border-t border-slate-800 pt-5">
                    <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all"><Plus className="w-4 h-4" /> Добавить урок</button>
                    <div className="flex items-center gap-4 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                        <button onClick={() => changeDate('prev')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-sm font-bold text-white min-w-[180px] text-center capitalize">
                            {viewMode === 'week' && `${format(startDate, 'd MMM', { locale: ru })} - ${format(addDays(startDate, 6), 'd MMM', { locale: ru })}`}
                            {viewMode === 'day' && format(currentDate, 'd MMMM yyyy', { locale: ru })}
                            {viewMode === 'month' && format(currentDate, 'LLLL yyyy', { locale: ru })}
                        </span>
                        <button onClick={() => changeDate('next')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl min-h-[600px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600" /></div>
                )}

                {/* WEEK VIEW (Existing logic) */}
                {viewMode === 'week' && (
                    <>
                        <div className="grid grid-cols-8 border-b border-slate-800">
                            <div className="p-4 border-r border-slate-800 bg-slate-800/50 text-xs font-semibold text-slate-500 text-center">Время</div>
                            {weekDays.map((day, idx) => (
                                <div key={idx} className={`p-3 text-center border-r border-slate-800 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-purple-500/10' : ''}`}>
                                    <p className={`text-xs font-bold uppercase mb-1 ${isSameDay(day, new Date()) ? 'text-purple-400' : 'text-slate-500'}`}>{format(day, 'EEEE', { locale: ru })}</p>
                                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isSameDay(day, new Date()) ? 'bg-purple-600 text-white' : 'text-slate-300'}`}>{format(day, 'd', { locale: ru })}</div>
                                </div>
                            ))}
                        </div>
                        <div className="relative">
                            {timeSlots.map((time, idx) => (
                                <div key={idx} className="grid grid-cols-8 border-b border-slate-800 min-h-[100px]">
                                    <div className="border-r border-slate-800 bg-slate-800/30 text-xs text-slate-500 font-medium flex items-start justify-center pt-2">{time}</div>
                                    {weekDays.map((day, dIdx) => (
                                        <div key={dIdx} className="border-r border-slate-800 last:border-r-0 p-1 relative group">
                                            {/* Render Lessons */}
                                            {lessons.filter(l => isSameDay(new Date(l.date), day) && new Date(l.date).getHours() === parseInt(time.split(':')[0])).map(l => (
                                                <div key={l.id} className={`p-2 rounded-lg border text-xs mb-1 ${getEventColor(l.group?.course?.name)}`}>
                                                    <div className="font-bold truncate">{l.group?.course?.name}</div>
                                                    <div className="opacity-70 truncate">{l.group?.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* DAY VIEW */}
                {viewMode === 'day' && (
                    <div className="p-6">
                        {lessons.filter(l => isSameDay(new Date(l.date), currentDate)).length === 0 ? (
                            <div className="text-center py-20 text-slate-500">Нет занятий</div>
                        ) : (
                            lessons.filter(l => isSameDay(new Date(l.date), currentDate))
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map(l => (
                                    <div key={l.id} className="flex gap-4 mb-6">
                                        <div className="w-20 text-right font-bold text-slate-400">{format(new Date(l.date), 'HH:mm')}</div>
                                        <div className={`flex-1 p-4 rounded-xl border bg-slate-800/50 ${getEventColor(l.group?.course?.name)}`}>
                                            <h3 className="font-bold text-lg">{l.group?.course?.name}</h3>
                                            <p className="opacity-80">{l.group?.name} • {l.group?.teacher?.name}</p>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                )}

                {/* MONTH VIEW */}
                {viewMode === 'month' && (
                    <div>
                        <div className="grid grid-cols-7 border-b border-slate-800">
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="p-3 text-center text-xs font-bold text-slate-500 uppercase border-r border-slate-800 last:border-0">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7">
                            {eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }), end: endOfMonth(currentDate) }).map(day => (
                                <div key={day.toISOString()} className={`min-h-[120px] border-r border-b border-slate-800 p-2 ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}`}>
                                    <div className="text-right text-xs font-bold text-slate-500 mb-2">{format(day, 'd')}</div>
                                    <div className="space-y-1">
                                        {lessons.filter(l => isSameDay(new Date(l.date), day)).map(l => (
                                            <div key={l.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${getEventColor(l.group?.course?.name)}`}>
                                                {format(new Date(l.date), 'HH:mm')} {l.group?.course?.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Lesson Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden anim-scale-in">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-purple-500" />
                                Добавить урок
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Группа</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={formData.groupId}
                                    onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                                >
                                    <option value="">Выберите группу</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Дата</label>
                                    <input
                                        type="date" required
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Время</label>
                                    <input
                                        type="time" required
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Длительность (мин)</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Тема (опционально)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors">Отмена</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
