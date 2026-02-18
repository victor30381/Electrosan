import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Moon, Sun } from 'lucide-react';

interface LoginPageProps {
    isLightMode?: boolean;
    toggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isLightMode, toggleTheme }) => {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este correo electrónico ya está registrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else if (err.code === 'auth/invalid-email') {
                setError('El formato del email no es válido.');
            } else {
                setError('Hubo un problema. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-500 ${isLightMode ? 'bg-gray-50' : 'bg-black'}`}>
            {/* Ambient Background Glows */}
            <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse ${isLightMode ? 'bg-neon-400/20' : 'bg-neon-400/10'}`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full ${isLightMode ? 'bg-neon-400/10' : 'bg-neon-400/5'}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none ${isLightMode ? '' : 'bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.03)_0%,transparent_70%)]'}`} />

            {/* Theme Toggle Button */}
            {toggleTheme && (
                <button
                    onClick={toggleTheme}
                    className={`absolute top-6 right-6 p-3 rounded-full transition-all duration-300 z-50 ${isLightMode
                        ? 'bg-white shadow-lg text-gray-800 hover:bg-gray-100 hover:text-black'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                    title={isLightMode ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
                >
                    {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            )}

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group mb-6">
                        <div className={`absolute inset-0 blur-2xl rounded-full transition-all duration-700 ${isLightMode ? 'bg-neon-400/40 group-hover:bg-neon-400/50' : 'bg-neon-400/20 group-hover:bg-neon-400/30'}`} />
                        <img
                            src={`${(import.meta as any).env.BASE_URL}logo.png`}
                            alt="Electrosan Logo"
                            className={`w-24 h-24 relative z-10 transition-transform duration-500 group-hover:scale-105 ${!isLightMode && 'drop-shadow-[0_0_20px_rgba(57,255,20,0.3)]'}`}
                        />
                    </div>
                    <h1 className={`text-4xl font-black tracking-tighter text-center uppercase ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                        ELECTRO<span className="text-neon-400">SAN</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`h-px w-8 ${isLightMode ? 'bg-gray-300' : 'bg-white/10'}`} />
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isLightMode ? 'text-gray-500' : 'text-white/40'}`}>
                            {isRegister ? 'Registro de Usuario' : 'Panel de Administración'}
                        </p>
                        <div className={`h-px w-8 ${isLightMode ? 'bg-gray-300' : 'bg-white/10'}`} />
                    </div>
                </div>

                {/* Auth Card */}
                <div className={`rounded-[40px] p-8 md:p-10 relative group overflow-hidden transition-all duration-500 ${isLightMode
                    ? 'bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100'
                    : 'glass-glow border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]'
                    }`}>
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400 to-transparent ${isLightMode ? 'opacity-80' : 'opacity-50'}`} />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className={`text-[10px] uppercase font-black tracking-widest ml-1 ${isLightMode ? 'text-gray-500' : 'text-white/40'}`}>Correo Electrónico</label>
                            <div className="relative flex items-center group/input">
                                <Mail className={`absolute left-4 transition-colors ${isLightMode ? 'text-gray-400 group-focus-within/input:text-neon-600' : 'text-white/20 group-focus-within/input:text-neon-400'}`} size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full rounded-2xl py-4 pl-12 pr-6 focus:outline-none transition-all font-medium ${isLightMode
                                        ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-neon-500 placeholder:text-gray-400'
                                        : 'bg-white/5 border border-white/10 text-white focus:border-neon-400/50 focus:bg-white/[0.08] placeholder:text-white/10'
                                        }`}
                                    placeholder="admin@electrosan.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={`text-[10px] uppercase font-black tracking-widest ml-1 ${isLightMode ? 'text-gray-500' : 'text-white/40'}`}>Contraseña</label>
                            <div className="relative flex items-center group/input">
                                <Lock className={`absolute left-4 transition-colors ${isLightMode ? 'text-gray-400 group-focus-within/input:text-neon-600' : 'text-white/20 group-focus-within/input:text-neon-400'}`} size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full rounded-2xl py-4 pl-12 pr-6 focus:outline-none transition-all font-medium ${isLightMode
                                        ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-neon-500 placeholder:text-gray-400'
                                        : 'bg-white/5 border border-white/10 text-white focus:border-neon-400/50 focus:bg-white/[0.08] placeholder:text-white/10'
                                        }`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-neon-md hover:shadow-neon-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group/btn ${isLightMode ? 'bg-neon-400 text-black hover:bg-neon-500' : 'bg-neon-400 text-black'}`}
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {isRegister ? 'Crear Cuenta' : 'Acceder al Sistema'}
                                    <LogIn size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsRegister(!isRegister); setError(null); }}
                                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isLightMode ? 'text-gray-500 hover:text-neon-600' : 'text-white/40 hover:text-neon-400'}`}
                            >
                                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className={`text-center mt-8 text-[10px] font-black uppercase tracking-[0.2em] ${isLightMode ? 'text-gray-400' : 'text-white/20'}`}>
                    Electrosan Management System &copy; 2026
                </p>
            </div>
        </div>
    );
};
