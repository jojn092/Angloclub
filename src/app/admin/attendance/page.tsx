'use client';

import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useState, useEffect } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const columns = [
    { key: 'studentName', label: 'Студент' },
    { key: 'groupName', label: 'Группа' },
    { key: 'dateFormatted', label: 'Дата' },
    { key: 'status', label: 'Статус' },
];

export default function AttendancePage() {
    const [data, setData] = useState<any[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/attendance?date=${date}`)
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    // Flatten the nested structure: Lesson -> Attendance[] -> Student
                    const flatData: any[] = [];
                    res.data.forEach((lesson: any) => {
                        lesson.attendance.forEach((att: any) => {
                            flatData.push({
                                id: att.id,
                                studentName: att.student.name,
                                groupName: lesson.group.name,
                                dateFormatted: format(new Date(lesson.date), 'dd MMM HH:mm', { locale: ru }),
                                status: att.status
                            });
                        });
                    });
                    setData(flatData);
                }
            })
            .finally(() => setIsLoading(false));
    }, [date]);

    return (
        <div>
            <PageHeader title="Посещаемость" description="История посещений" />

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm flex items-end gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Дата</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /> : (
                data.length > 0 ? <DataTable columns={columns} data={data} /> : <div className="text-center py-10 text-slate-500">Нет данных за эту дату</div>
            )}
        </div>
    );
}
