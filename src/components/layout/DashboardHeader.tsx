'use client';

import { Bell, Moon, Sun, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import ProfileModal from '@/components/profile/ProfileModal';

interface User {
    name: string;
    role: string;
    email: string;
    phone?: string;
}

export function DashboardHeader() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const fetchUser = () => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        setMounted(true);
        fetchUser();
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleName = (role: string) => {
        if (role === 'ADMIN') return 'Администратор';
        if (role === 'MANAGER') return 'Менеджер';
        if (role === 'TEACHER') return 'Преподаватель';
        return role;
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-30 shadow-sm/50 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <h2 className="text-slate-500 dark:text-slate-400 text-sm">
                    Добро пожаловать в <span className="font-semibold text-blue-600 dark:text-blue-400">AngloClub CRM</span>
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>

                <div
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (user ? getInitials(user.name) : 'U')}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">
                            {loading ? 'Загрузка...' : (user ? user.name : 'Пользователь')}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-none">
                            {loading ? '...' : (user ? getRoleName(user.role) : 'Гость')}
                        </p>
                    </div>
                </div>
            </div>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdate={fetchUser}
            />
        </header>
    );
}
