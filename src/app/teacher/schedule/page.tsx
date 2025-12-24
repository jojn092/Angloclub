'use client';

import { useState, useEffect } from 'react';
import { format, addDays, subDays, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, addMonths, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Users, CheckCircle, XCircle, Clock, MapPin, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';

interface Student {
    id: number;
    name: string;
}

interface Lesson {
    id: number;
    date: string;
    duration: number;
    topic?: string;
    isCompleted: boolean;
    group: {
        id?: number;
        name: string;
        students: Student[];
        room?: { name: string };
        course?: { name: string };
    };
    attendance: { studentId: number; status: string; grade?: number; comment?: string }[];
}

const timeSlots = Array.from({ length: 14 }).map((_, i) => `${i + 8}:00`); // 08:00 to 21:00

const getEventColor = (name: string = '') => {
    const colors = [
        'bg-blue-600/10 border-blue-500/50 text-blue-700 dark:text-blue-300',
        'bg-purple-600/10 border-purple-500/50 text-purple-700 dark:text-purple-300',
        'bg-green-600/10 border-green-500/50 text-green-700 dark:text-green-300',
        'bg-orange-600/10 border-orange-500/50 text-orange-700 dark:text-orange-300',
        'bg-pink-600/10 border-pink-500/50 text-pink-700 dark:text-pink-300',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};


export default function TeacherSchedulePage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    // Attendance Modal State
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [attendanceData, setAttendanceData] = useState<Record<number, { status: string; grade: string; comment: string }>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLessons();
    }, [currentDate, viewMode]);

    const fetchLessons = async () => {
        setLoading(true);
        try {
            let from, to;

            if (viewMode === 'day') {
                from = format(startOfDay(currentDate), 'yyyy-MM-dd HH:mm:ss');
                to = format(endOfDay(currentDate), 'yyyy-MM-dd HH:mm:ss');
            } else if (viewMode === 'week') {
                from = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss');
                to = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss');
            } else {
                from = format(startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss');
                to = format(endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss');
            }

            // Using pure date string for simplicity if API handles it, but safer to pass ISO
            // Actually our API logic handles 'from' and 'to' via new Date().
            // Let's pass ISO strings.
            const res = await fetch(`/api/teacher/lessons?from=${new Date(from).toISOString()}&to=${new Date(to).toISOString()}`);

            const data = await res.json();
            if (data.success) {
                setLessons(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Helper for start/end of day logic above (since imported date-fns functions return Dates, we format them)
    // Actually imports are incomplete inside helper. Let's fix imports first.
    // I need startOfDay and endOfDay imported.

    const changeDate = (direction: 'prev' | 'next') => {
        if (viewMode === 'week') setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
        if (viewMode === 'day') setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
        if (viewMode === 'month') setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    const openAttendance = (lesson: Lesson) => {
        setCurrentLesson(lesson);
        const initialData: Record<number, { status: string; grade: string; comment: string }> = {};
        lesson.group.students.forEach(s => {
            const existing = lesson.attendance.find(a => a.studentId === s.id);
            initialData[s.id] = {
                status: existing ? existing.status : 'PRESENT',
                grade: existing?.grade ? String(existing.grade) : '',
                comment: existing?.comment || ''
            };
        });
        setAttendanceData(initialData);
        setIsAttendanceOpen(true);
    };

    const submitAttendance = async () => {
        if (!currentLesson) return;
        setSubmitting(true);
        try {
            const records = Object.entries(attendanceData).map(([studentId, data]) => ({
                studentId: Number(studentId),
                status: data.status,
                grade: data.grade,
                comment: data.comment
            }));

            const payload: any = {};
            if (currentLesson.id < 0) {
                // Virtual lesson
                payload.groupId = currentLesson.group.id; // We need to ensure group object has id
                // But wait, the Lesson interface says group: { name: string; students: Student[]; ... }
                // Does it have ID?
                // The API sends full group object included.
                // Let's verify interface first or cast it.
                // Looking at API: include: { group: ... } -> returns id by default.

                // We need to extend the interface in this file or cast.
                // Let's rely on runtime or fix interface.
                // The interface Lesson above line 20: 
                // group: { name: string; students: Student[]; room?: ...; course?: ... }
                // It's missing 'id'. This might cause TS error.
                // I should assume it's there at runtime.
                // Better to update interface too? No, replace_file limit.
                // I'll cast it to any for now to avoid TS error: (currentLesson.group as any).id

                payload.groupId = (currentLesson.group as any).id;
                payload.date = currentLesson.date;
                payload.records = records;
            } else {
                payload.lessonId = currentLesson.id;
                payload.records = records;
            }

            const res = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsAttendanceOpen(false);
                fetchLessons();
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // --- VIEWS ---

    const WeekView = () => {
        const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="p-3 text-xs font-semibold text-slate-500 text-center border-r border-slate-200 dark:border-slate-800">Время</div>
                    {weekDays.map((day, idx) => (
                        <div key={idx} className={`p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-0 ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                            <div className={`text-xs font-bold uppercase mb-1 ${isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{format(day, 'EEEE', { locale: ru })}</div>
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>{format(day, 'd')}</div>
                        </div>
                    ))}
                </div>
                <div className="h-[600px] overflow-y-auto custom-scrollbar">
                    {timeSlots.map((time, idx) => (
                        <div key={idx} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 min-h-[80px]">
                            <div className="border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-500 font-medium flex justify-center pt-2">{time}</div>
                            {weekDays.map((day, dIdx) => (
                                <div key={dIdx} className="border-r border-slate-200 dark:border-slate-800 last:border-0 p-1 relative">
                                    {lessons.filter(l => isSameDay(new Date(l.date), day) && new Date(l.date).getHours() === parseInt(time.split(':')[0])).map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => openAttendance(l)}
                                            className={`w-full text-left p-2 rounded-lg border text-xs mb-1 transition-all hover:scale-[1.02] active:scale-95 ${getEventColor(l.group?.name)} ${l.isCompleted ? 'ring-1 ring-green-500/50' : ''}`}
                                        >
                                            <div className="font-bold truncate">{l.group?.name}</div>
                                            <div className="flex items-center justify-between opacity-80 mt-1">
                                                <span className="truncate">{l.group?.room?.name || 'Кабинет?'}</span>
                                                {l.isCompleted && <CheckCircle className="w-3 h-3 text-green-600" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    const DayView = () => (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6 min-h-[400px]">
            {lessons.filter(l => isSameDay(new Date(l.date), currentDate)).length === 0 ? (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                    <span>Нет занятий на этот день</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {lessons.filter(l => isSameDay(new Date(l.date), currentDate))
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map(l => (
                            <div key={l.id} className="flex gap-4 group">
                                <div className="w-20 text-right pt-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                                    {format(new Date(l.date), 'HH:mm')}
                                </div>
                                <div className={`flex-1 p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${getEventColor(l.group?.name)}`} onClick={() => openAttendance(l)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{l.group?.name}</h3>
                                            <p className="text-sm opacity-80 mt-1">{l.group?.course?.name} • {l.group?.room?.name}</p>
                                        </div>
                                        {l.isCompleted ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Проведен
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                Запланирован
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );

    const MonthView = () => (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <div key={d} className="p-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-r border-slate-200 dark:border-slate-800 last:border-0">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
                {eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }) }).map(day => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const daysLessons = lessons.filter(l => isSameDay(new Date(l.date), day));

                    return (
                        <div key={day.toISOString()} className={`min-h-[100px] p-2 border-r border-b border-slate-200 dark:border-slate-800 ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-40' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors`}>
                            <div className={`text-right text-xs font-bold mb-2 ${isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                {format(day, 'd')}
                            </div>
                            <div className="space-y-1">
                                {daysLessons.map(l => (
                                    <button
                                        key={l.id}
                                        onClick={() => openAttendance(l)}
                                        className={`w-full text-left px-1.5 py-1 rounded text-[10px] truncate border ${getEventColor(l.group?.name)} ${l.isCompleted ? 'opacity-60' : ''}`}
                                    >
                                        <span className="font-bold mr-1">{format(new Date(l.date), 'HH:mm')}</span>
                                        {l.group?.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );

    // Helper for start/end of day logic
    function startOfDay(date: Date): Date { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; }
    function endOfDay(date: Date): Date { const d = new Date(date); d.setHours(23, 59, 59, 999); return d; }


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    Мое Расписание
                </h1>

                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button onClick={() => setViewMode('day')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'day' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>День</button>
                    <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>Неделя</button>
                    <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>Месяц</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <button onClick={() => changeDate('prev')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                <div className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                    {viewMode === 'week' ? (
                        `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: ru })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: ru })}`
                    ) : (
                        format(currentDate, viewMode === 'day' ? 'd MMMM yyyy' : 'LLLL yyyy', { locale: ru })
                    )}
                </div>
                <button onClick={() => changeDate('next')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
            ) : (
                <>
                    {viewMode === 'week' && <WeekView />}
                    {viewMode === 'day' && <DayView />}
                    {viewMode === 'month' && <MonthView />}
                </>
            )}

            {/* Attendance Modal */}
            {isAttendanceOpen && currentLesson && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] anim-scale-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Отметить посещаемость</h2>
                                <p className="text-sm text-slate-500">{currentLesson.group.name} • {format(new Date(currentLesson.date), 'dd.MM HH:mm')}</p>
                            </div>
                            <button onClick={() => setIsAttendanceOpen(false)}><XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {currentLesson.group.students.map(student => {
                                const data = attendanceData[student.id] || { status: 'PRESENT', grade: '', comment: '' };
                                return (
                                    <div key={student.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="font-bold text-slate-800 dark:text-white text-lg">{student.name}</span>
                                            <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1">
                                                {['PRESENT', 'ABSENT', 'EXCUSED'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => setAttendanceData(prev => ({
                                                            ...prev,
                                                            [student.id]: { ...prev[student.id], status }
                                                        }))}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${data.status === status
                                                            ? (status === 'PRESENT' ? 'bg-green-500 text-white' : status === 'ABSENT' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white')
                                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                            }`}
                                                    >
                                                        {status === 'PRESENT' ? 'Был' : status === 'ABSENT' ? 'Н/Б' : 'Уваж.'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {data.status === 'PRESENT' && (
                                            <div className="grid grid-cols-12 gap-3">
                                                <div className="col-span-3">
                                                    <label className="text-xs text-slate-500 mb-1 block">Оценка (1-10)</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        className="w-full px-3 py-2 rounded-lg border dark:bg-slate-900 dark:border-slate-700 text-sm font-bold text-center"
                                                        placeholder="-"
                                                        value={data.grade}
                                                        onChange={e => setAttendanceData(prev => ({
                                                            ...prev,
                                                            [student.id]: { ...prev[student.id], grade: e.target.value }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="col-span-9">
                                                    <label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 rounded-lg border dark:bg-slate-900 dark:border-slate-700 text-sm"
                                                        placeholder="Как прошел урок?"
                                                        value={data.comment}
                                                        onChange={e => setAttendanceData(prev => ({
                                                            ...prev,
                                                            [student.id]: { ...prev[student.id], comment: e.target.value }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => setIsAttendanceOpen(false)} className="px-4 py-2 text-slate-500">Отмена</button>
                            <button
                                onClick={submitAttendance}
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Сохранение...' : 'Подтвердить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
