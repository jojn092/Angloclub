'use client';

import { LogOut, GraduationCap, Calendar, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface TeacherHeaderProps {
    onLogout: () => void;
}

export default function TeacherHeader({ onLogout }: TeacherHeaderProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-bold text-white tracking-tight">AngloClub</h1>
                    </div>
                </div>

                <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                    <Link href="/teacher"
                        className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${isActive('/teacher') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Users className="w-4 h-4" />
                        Группы
                    </Link>
                    <Link href="/teacher/schedule"
                        className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${isActive('/teacher/schedule') ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Calendar className="w-4 h-4" />
                        Расписание
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Выйти
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                        T
                    </div>
                </div>
            </div>
        </header>
    );
}
