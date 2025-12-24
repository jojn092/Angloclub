'use client';

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import { Plus, FileText, Download, Loader2, Trash2 } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TeacherReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [form, setForm] = useState({
        period: format(new Date(), 'yyyy-MM'),
        lessons1h: 0,
        lessons15h: 0,
        trials: 0,
        ielts: 0,
        speaking: 0,
        comment: ''
    });

    useEffect(() => {
        fetchReports();
        fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/teacher/reports');
            const data = await res.json();
            if (data.success) setReports(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/teacher/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchReports();
            }
        } catch (error) {
            alert('Ошибка');
        }
    };

    const generatePDF = (report: any) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Отчет преподавателя', 14, 22);

        doc.setFontSize(12);
        doc.text(`Преподаватель: ${user?.name || 'Unknown'}`, 14, 32);
        doc.text(`Период: ${report.period}`, 14, 38);
        doc.text(`Дата создания: ${format(new Date(report.createdAt), 'dd.MM.yyyy HH:mm')}`, 14, 44);

        const tableData = [
            ['Тип занятия', 'Количество'],
            ['Уроки (1 час)', report.lessons1h],
            ['Уроки (1.5 часа)', report.lessons15h],
            ['Пробные уроки', report.trials],
            ['IELTS Mock', report.ielts],
            ['Speaking Club/Exam', report.speaking],
        ];

        autoTable(doc, {
            head: [tableData[0]],
            body: tableData.slice(1),
            startY: 50,
        });

        if (report.comment) {
            const finalY = (doc as any).lastAutoTable.finalY || 50;
            doc.text(`Комментарий: ${report.comment}`, 14, finalY + 10);
        }

        doc.save(`Report_${user?.name}_${report.period}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Мои Отчеты</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Новый отчет
                </button>
            </div>

            {loading ? <Loader2 className="animate-spin" /> : (
                <div className="grid gap-4">
                    {reports.map((report: any) => (
                        <div key={report.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Отчет за {report.period}</h3>
                                <p className="text-sm text-slate-500">Создан: {format(new Date(report.createdAt), 'dd MMMM yyyy', { locale: ru })}</p>
                                <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    <span>1ч: {report.lessons1h}</span>
                                    <span>1.5ч: {report.lessons15h}</span>
                                    <span>Trial: {report.trials}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => generatePDF(report)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Скачать PDF
                            </button>
                        </div>
                    ))}
                    {reports.length === 0 && <p className="text-slate-400">Нет отчетов</p>}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Новый отчет</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Период (Месяц)</label>
                                <input required type="month" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Уроки (1 час)</label>
                                    <input type="number" min="0" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={form.lessons1h} onChange={e => setForm({ ...form, lessons1h: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Уроки (1.5 часа)</label>
                                    <input type="number" min="0" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={form.lessons15h} onChange={e => setForm({ ...form, lessons15h: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Пробные уроки</label>
                                    <input type="number" min="0" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={form.trials} onChange={e => setForm({ ...form, trials: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">IELTS Mock</label>
                                    <input type="number" min="0" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={form.ielts} onChange={e => setForm({ ...form, ielts: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Speaking</label>
                                    <input type="number" min="0" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={form.speaking} onChange={e => setForm({ ...form, speaking: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Комментарий</label>
                                <textarea className="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={3} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500">Отмена</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Отправить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
