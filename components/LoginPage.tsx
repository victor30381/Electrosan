import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
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
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-400/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-400/5 blur-[120px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.03)_0%,transparent_70%)] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group mb-6">
                        <div className="absolute inset-0 bg-neon-400/20 blur-2xl rounded-full group-hover:bg-neon-400/30 transition-all duration-700" />
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            alt="Electrosan Logo"
                            className="w-24 h-24 relative z-10 drop-shadow-[0_0_20px_rgba(57,255,20,0.3)] group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter text-center uppercase">
                        ELECTRO<span className="text-neon-400">SAN</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-px w-8 bg-white/10" />
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">
                            {isRegister ? 'Registro de Usuario' : 'Panel de Administración'}
                        </p>
                        <div className="h-px w-8 bg-white/10" />
                    </div>
                </div>

                {/* Auth Card */}
                <div className="glass-glow border border-white/10 rounded-[40px] p-8 md:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400 to-transparent opacity-50" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative flex items-center group/input">
                                <Mail className="absolute left-4 text-white/20 group-focus-within/input:text-neon-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-6 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/10 font-medium"
                                    placeholder="admin@electrosan.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Contraseña</label>
                            <div className="relative flex items-center group/input">
                                <Lock className="absolute left-4 text-white/20 group-focus-within/input:text-neon-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-6 focus:border-neon-400/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/10 font-medium"
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
                            className="w-full bg-neon-400 text-black font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-neon-md hover:shadow-neon-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
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
                                className="text-[10px] text-white/40 hover:text-neon-400 font-bold uppercase tracking-widest transition-colors"
                            >
                                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center mt-8 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                    Electrosan Management System &copy; 2026
                </p>
            </div>
        </div>
    );
};
