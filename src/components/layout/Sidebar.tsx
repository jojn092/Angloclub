'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    LayoutGrid,
    BookOpen,
    GraduationCap,
    CalendarDays,
    Calendar,
    CheckCircle,
    FileText,
    Library,
    DollarSign,
    PieChart,
    ShoppingBag,
    MessageSquare,
    LogOut,
    Activity,
    UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'Аналитика', href: '/admin', icon: BarChart3 },
    { name: 'Пользователи', href: '/admin/students', icon: Users },
    { name: 'Кабинеты', href: '/admin/rooms', icon: LayoutGrid },
    { name: 'Предметы', href: '/admin/subjects', icon: BookOpen },
    { name: 'Группы', href: '/admin/groups', icon: GraduationCap },
    { name: 'Расписание', href: '/admin/schedules', icon: CalendarDays },
    { name: 'Календарь', href: '/admin/lessons', icon: Calendar },
    { name: 'Посещаемость', href: '/admin/attendance', icon: CheckCircle },
    { name: 'Материалы', href: '/admin/materials', icon: Library },
    { name: 'Финансы (ДДС)', href: '/admin/finance', icon: PieChart },
    { name: 'Зарплаты', href: '/admin/salaries', icon: DollarSign },
];

export function Sidebar() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setRole(data.user.role);
            })
            .catch(console.error);
    }, []);


    const adminItems = [
        { name: 'Аналитика', href: '/admin', icon: BarChart3 },
        { name: 'Сотрудники', href: '/admin/users', icon: UserCog },
        { name: 'История действий', href: '/admin/logs', icon: Activity },
        { name: 'Студенты', href: '/admin/students', icon: Users },
        { name: 'Кабинеты', href: '/admin/rooms', icon: LayoutGrid },
        { name: 'Предметы', href: '/admin/subjects', icon: BookOpen },
        { name: 'Группы', href: '/admin/groups', icon: GraduationCap },
        { name: 'Шаблоны расписания', href: '/admin/schedules', icon: CalendarDays },
        { name: 'Календарь', href: '/admin/lessons', icon: Calendar },
        { name: 'Посещаемость', href: '/admin/attendance', icon: CheckCircle },
        { name: 'Материалы', href: '/admin/materials', icon: Library },
        { name: 'Шаблоны сообщений', href: '/admin/message-templates', icon: MessageSquare },
        { name: 'Финансы (ДДС)', href: '/admin/finance', icon: PieChart },
        { name: 'Зарплаты', href: '/admin/salaries', icon: DollarSign },
    ];

    const teacherItems = [
        { name: 'Расписание', href: '/teacher/schedule', icon: CalendarDays },
        { name: 'Мои Группы', href: '/teacher/groups', icon: GraduationCap },
    ];

    if (!role) {
        return <div className="h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800" />;
    }

    const items = role === 'TEACHER' ? teacherItems : adminItems;

    return (
        <div className="flex h-screen w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 fixed left-0 top-0 z-40 shadow-sm transition-colors duration-300">
            <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800">
                <Link href={role === 'TEACHER' ? "/teacher/schedule" : "/admin"} className="flex items-center gap-2">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AngloClub
                    </span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                            {item.name}
                        </Link>
                    );
                })}

            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/admin/login';
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    Выйти
                </button>
            </div>
        </div>
    );
}
