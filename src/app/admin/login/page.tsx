'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Determine redirect based on role
                if (data.user?.role === 'TEACHER') {
                    window.location.href = '/teacher';
                } else if (data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER' || data.user?.role === 'SUPER_ADMIN') {
                    window.location.href = '/admin';
                } else {
                    // Fallback
                    window.location.href = '/admin';
                }
            } else {
                setError(data.error || 'Неверный email или пароль');
            }
        } catch (err) {
            setError('Ошибка сети. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md z-10 p-6">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 transform transition-all hover:scale-[1.01] hover:shadow-purple-500/10 hover:border-white/20">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30 mb-4 animate-fade-in">
                            <span className="text-3xl font-bold text-white">A</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">AngloClub CRM</h1>
                        <p className="text-slate-400 text-sm">Вход для администраторов и преподавателей</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold ml-1 transition-colors ${focusedField === 'email' ? 'text-indigo-400' : 'text-slate-500'}`}>Email</label>
                            <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                                <Mail className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="name@example.com"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={`text-xs font-semibold ml-1 transition-colors ${focusedField === 'password' ? 'text-indigo-400' : 'text-slate-500'}`}>Пароль</label>
                            <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                                <Lock className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4 group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Войти в систему
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-xs">
                            Забыли пароль? Обратитесь к администратору
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center mt-8 opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs">© 2025 AngloClub Astana. Все права защищены</p>
                </div>
            </div>
        </div>
    );
}
