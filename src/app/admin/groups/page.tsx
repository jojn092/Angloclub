'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useEffect } from "react";
import { GraduationCap, Search, Filter, Loader2, Plus, X, Check } from "lucide-react";

const columns = [
    { key: 'id', label: '#', width: '50px', align: 'center' as const },
    { key: 'name', label: 'Название группы' },
    { key: 'level', label: 'Уровень' },
    { key: 'subjectName', label: 'Предмет' },
    { key: 'teacherName', label: 'Преподаватель' },
    { key: 'roomName', label: 'Кабинет' },
    { key: 'studentsCount', label: 'Студенты', align: 'center' as const },
];

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Dropdown data
    const [courses, setCourses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        courseId: '',
        teacherId: '',
        roomId: '',
        studentIds: [] as number[]
    });
    const [isSaving, setIsSaving] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/groups');
            const data = await res.json();
            if (data.success) {
                const formatted = data.data.map((g: any) => ({
                    ...g,
                    subjectName: g.course?.name || '-',
                    teacherName: g.teacher?.name || '-',
                    roomName: g.room?.name || '-',
                    studentsCount: g._count?.students || 0
                })).filter((g: any) => g.name.toLowerCase().includes(search.toLowerCase()));
                setGroups(formatted);
            }
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    const fetchDependencies = async () => {
        try {
            const [cRes, tRes, rRes, sRes] = await Promise.all([
                fetch('/api/subjects'),
                fetch('/api/teachers'),
                fetch('/api/rooms'),
                fetch('/api/students')
            ]);

            const cData = await cRes.json();
            if (cData.success) setCourses(cData.data);

            const tData = await tRes.json();
            if (tData.success) setTeachers(tData.data);

            const rData = await rRes.json();
            if (rData.success) setRooms(rData.data);

            const sData = await sRes.json();
            if (sData.success) setAllStudents(sData.data);

        } catch (e) { console.error(e) }
    };

    useEffect(() => {
        fetchGroups();
        fetchDependencies();
    }, [search]);

    // -- Handlers --
    const handleEdit = (item: any) => {
        setEditingGroup(item);
        setFormData({
            name: item.name,
            level: item.level,
            courseId: item.courseId,
            teacherId: item.teacherId,
            roomId: item.roomId || '',
            studentIds: [] // Loading existing students is separate and maybe expensive, for now empty or TODO
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingGroup(null);
        setFormData({ name: '', level: '', courseId: '', teacherId: '', roomId: '', studentIds: [] });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Удалить группу?')) return;
        try {
            await fetch(`/api/groups/${item.id}`, { method: 'DELETE' });
            fetchGroups();
        } catch (e) { alert('Ошибка удаления'); }
    };

    const toggleStudent = (id: number) => {
        setFormData(prev => {
            const exists = prev.studentIds.includes(id);
            if (exists) return { ...prev, studentIds: prev.studentIds.filter(sid => sid !== id) };
            return { ...prev, studentIds: [...prev.studentIds, id] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingGroup ? `/api/groups/${editingGroup.id}` : '/api/groups';
            const method = editingGroup ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) { setIsModalOpen(false); fetchGroups(); }
            else { alert('Ошибка сохранения'); }
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    const filteredStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.phone.includes(studentSearch)
    );

    return (
        <div>
            <PageHeader
                title="Группы"
                description="Управление учебными группами"
            />

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{groups.length}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Всего групп</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:max-w-md relative">
                    <input
                        type="text"
                        placeholder="Поиск группы..."
                        className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 transition-all whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Создать группу
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={groups}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col max-h-[90vh]">
                        {/* Header - Teal */}
                        <div className="px-6 py-5 bg-teal-500 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        {editingGroup ? 'Редактировать группу' : 'Добавить группу'}
                                    </h2>
                                    <p className="text-teal-100 text-xs font-medium">
                                        {editingGroup ? 'Изменение параметров группы' : 'Создание новой группы'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form - Scrollable Content */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">

                            {/* Group Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-300 block mb-2">Название группы</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Введите название группы"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-300 block mb-2">Предмет *</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all appearance-none"
                                            value={formData.courseId}
                                            onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                        >
                                            <option value="">Выберите предмет</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-300 block mb-2">Уровень</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all appearance-none"
                                            value={formData.level}
                                            onChange={e => setFormData({ ...formData, level: e.target.value })}
                                        >
                                            <option value="">Выберите уровень</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Elementary">Elementary</option>
                                            <option value="Pre-Intermediate">Pre-Intermediate</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Upper-Intermediate">Upper-Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-300 block mb-2">Преподаватель</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all appearance-none"
                                            value={formData.teacherId}
                                            onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                                        >
                                            <option value="">Выберите преподавателя</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-300 block mb-2">Кабинет</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all appearance-none"
                                            value={formData.roomId}
                                            onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                        >
                                            <option value="">Без кабинета</option>
                                            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Students Selection */}
                            <div className="space-y-3 pt-2">
                                <label className="text-sm font-semibold text-slate-300 block">Студенты</label>
                                <input
                                    type="text"
                                    placeholder="Поиск по имени или телефону..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-sm"
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                />

                                <div className="h-48 overflow-y-auto bg-slate-800/50 rounded-xl border border-slate-700 p-2 space-y-1 custom-scrollbar">
                                    {filteredStudents.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500 text-sm">Нет студентов</div>
                                    ) : (
                                        filteredStudents.map(student => {
                                            const isSelected = formData.studentIds.includes(student.id);
                                            return (
                                                <div
                                                    key={student.id}
                                                    onClick={() => toggleStudent(student.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-slate-500'
                                                        }`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-200">{student.name}</p>
                                                        <p className="text-xs text-slate-500">{student.phone}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">Выбрано студентов: {formData.studentIds.length}</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-600"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/20 transition-all"
                                >
                                    {isSaving ? 'Сохранение...' : (editingGroup ? 'Сохранить изменения' : 'Создать группу')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
