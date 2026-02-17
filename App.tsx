import React, { useState } from 'react';
import { LayoutDashboard, Users, DollarSign, TrendingUp, X, Menu, AlertCircle, ShoppingBag, PieChart, Check, Sun, Moon } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Sales } from './components/Sales';
import { Accounting } from './components/Accounting';
import { LoginPage } from './components/LoginPage';
import { StoreProvider } from './store/StoreContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ViewState } from './types';
import { LogOut, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light';
  });

  // Toggle body class for global styles
  React.useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(prev => !prev);
  };

  // Theme-aware classes
  const theme = {
    bg: isLightMode ? 'bg-white' : 'bg-black',
    text: isLightMode ? 'text-black' : 'text-white',
    textMuted: isLightMode ? 'text-gray-500' : 'text-white/60',
    border: isLightMode ? 'border-gray-200' : 'border-white/5',
    cardBg: isLightMode ? 'bg-white shadow-lg border-gray-100' : 'glass-glow border-white/5',
    sidebarBg: isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-dark-950 border-white/5',
    primary: 'text-neon-400',
    headerBg: isLightMode ? 'bg-white/90 border-gray-200' : 'bg-dark-950/80 border-white/5'
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? 'bg-white' : 'bg-black'}`}>
        <Loader2 className={`${isLightMode ? 'text-neon-600' : 'text-neon-400'} animate-spin`} size={48} />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`relative w-full flex items-center gap-6 px-10 py-6 md:px-8 md:py-5 transition-all duration-500 group overflow-hidden ${currentView === view
        ? 'text-neon-400'
        : isLightMode ? 'text-gray-500 hover:text-black' : 'text-gray-500 hover:text-white'
        }`}
    >
      {/* Background Active Glow */}
      {currentView === view && (
        <div className={`absolute inset-0 bg-neon-400/[0.03] shadow-[inset_4px_0_20px_rgba(57,255,20,0.05)] border-l-4 border-neon-400 animate-in fade-in duration-700 ${isLightMode ? 'bg-neon-400/10' : ''}`} />
      )}

      {/* Hover Light Streak */}
      <div className="absolute inset-y-0 left-0 w-0 group-hover:w-full bg-gradient-to-r from-neon-400/[0.05] to-transparent transition-all duration-700 pointer-events-none" />

      <Icon
        size={20}
        className={`relative z-10 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 ${currentView === view
          ? 'drop-shadow-[0_0_10px_rgba(57,255,20,0.8)] stroke-[2.5px]'
          : `stroke-[1.5px] opacity-60 group-hover:opacity-100 group-hover:stroke-[2px] ${isLightMode ? 'group-hover:text-black' : 'group-hover:text-white'}`
          }`}
      />

      <span className={`relative z-10 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 ${currentView === view ? 'neon-text' : isLightMode ? 'group-hover:text-black group-hover:tracking-[0.3em]' : 'group-hover:tracking-[0.3em] group-hover:text-white'
        }`}>
        {label}
      </span>

      {currentView === view && (
        <div className="absolute left-0 w-1.5 h-1/2 bg-neon-400 blur-[4px] rounded-r-full animate-pulse" />
      )}
    </button>
  );

  return (
    <div className={`transition-colors duration-500 ${isLightMode ? 'light-mode' : ''}`}>
      <StoreProvider>
        <div className={`min-h-screen ${theme.bg} ${theme.text} flex font-sans overflow-hidden relative selection:bg-neon-400/30 selection:text-neon-400 transition-colors duration-500`}>

          {/* Global Abstract Background Glows */}
          <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-neon-400/[0.03] blur-[150px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-400/[0.02] blur-[150px] rounded-full pointer-events-none" />

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[100] animate-in fade-in duration-500">
              <div
                className={`absolute inset-0 backdrop-blur-2xl ${isLightMode ? 'bg-black/20' : 'bg-black/60'}`}
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className={`absolute inset-y-0 left-0 w-[85%] max-w-sm ${isLightMode ? 'bg-white/95 border-gray-200' : 'bg-dark-950/95 border-white/5'} border-r shadow-2xl flex flex-col p-8 animate-in slide-in-from-left duration-500`}>
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="w-10 h-10 object-contain drop-shadow-neon-sm" />
                    <span className={`font-black tracking-tighter text-xl ${isLightMode ? 'text-black' : 'text-white'}`}>ELECTRO<span className="text-neon-400">SAN</span></span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-3 rounded-2xl text-neon-400 ${isLightMode ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/5'}`}
                  >
                    <X size={24} />
                  </button>
                </div>

                <nav className="flex-1 -mx-8 overflow-y-auto">
                  <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem view="clients" icon={Users} label="Clientes" />
                  <NavItem view="sales" icon={DollarSign} label="Ventas" />
                  <NavItem view="accounting" icon={TrendingUp} label="Contabilidad" />

                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-6 px-10 py-6 transition-all font-black uppercase tracking-[0.2em] text-[10px] ${isLightMode ? 'text-black hover:text-gray-700' : 'text-gray-500 hover:text-white'}`}
                  >
                    {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                    {isLightMode ? 'Modo Oscuro' : 'Modo Claro'}
                  </button>

                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-6 px-10 py-6 text-red-500/60 hover:text-red-500 transition-all font-black uppercase tracking-[0.2em] text-[10px]"
                  >
                    <LogOut size={20} />
                    Cerrar Sesión
                  </button>
                </nav>

                <div className="mt-auto pt-8 border-t border-white/5">
                  <div className="flex items-center gap-4 p-4 glass-glow rounded-2xl border border-white/5">
                    <div className="w-3 h-3 bg-neon-400 rounded-full animate-pulse shadow-neon-sm" />
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">SISTEMA ACTIVO</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar (Desktop) */}
          <aside className={`hidden md:flex flex-col w-72 ${theme.sidebarBg} border-r h-screen sticky top-0 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.1)] relative overflow-y-auto custom-scrollbar transition-colors duration-500`}>
            {/* Sidebar Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-400/20 to-transparent" />

            <div className="p-10 mb-6 relative flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <div className="absolute inset-0 bg-neon-400 opacity-20 blur-3xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="ElectroSan Logo" className="w-36 h-36 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(57,255,20,0.4)] group-hover:drop-shadow-[0_0_30px_rgba(57,255,20,0.6)] transition-all duration-500 scale-110 group-hover:scale-125" />
              </div>

              <div className="relative inline-block group">
                <h1 className={`text-3xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all ${isLightMode ? 'text-black' : 'text-white'}`}>
                  ELECTRO<span className="text-neon-400">SAN</span>
                </h1>
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-neon-400/50 to-transparent blur-[1px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              </div>
              <p className="text-[9px] text-gray-700 mt-4 uppercase font-black tracking-[0.4em]">Integrated Admin System</p>
            </div>

            <nav className="flex-1 space-y-2 mt-4">
              <NavItem view="dashboard" icon={LayoutDashboard} label="Monitor Central" />
              <NavItem view="clients" icon={Users} label="Gestión Clientes" />
              <NavItem view="sales" icon={ShoppingBag} label="Operaciones" />
              <NavItem view="accounting" icon={PieChart} label="Estadísticas" />
            </nav>

            <div className="p-8 space-y-4">
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all group"
              >
                <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-[10px] font-black uppercase tracking-widest">Desconectar</span>
              </button>

              <div className="glass-glow border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-neon-400/20 transition-all duration-500">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-neon-400/5 blur-[30px] rounded-full group-hover:bg-neon-400/10 transition-all" />
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-3">Kernel Link</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute inset-0 bg-neon-400 rounded-full animate-ping opacity-20"></span>
                    <span className="relative block w-2.5 h-2.5 rounded-full bg-neon-400 shadow-neon-sm animate-pulse"></span>
                  </div>
                  <span className={`text-xs font-black ${isLightMode ? 'text-black' : 'text-white'} uppercase tracking-widest`}>Secured Node</span>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all ${isLightMode ? 'bg-gray-200 text-black border-gray-300' : 'bg-white/5 text-white border-white/10'}`}
              >
                {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
                {isLightMode ? 'Modo Oscuro' : 'Modo Claro'}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 h-screen overflow-y-auto relative">
            {/* Mobile Header */}
            <div className={`md:hidden flex items-center justify-between px-6 py-4 ${isLightMode ? 'bg-white/80 border-gray-200' : 'bg-dark-950/80 border-white/5'} border-b sticky top-0 z-30 backdrop-blur-xl transition-colors duration-500`}>
              <div className="flex items-center gap-4">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="ElectroSan Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" />
                <span className={`font-black tracking-tighter text-xl ${isLightMode ? 'text-black' : 'text-white'}`}>ELECTRO<span className="text-neon-400">SAN</span></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => logout()}
                  className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20 transition-all active:scale-95"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${mobileMenuOpen ? 'bg-neon-400 text-black shadow-neon-sm' : isLightMode ? 'bg-gray-100 text-black' : 'bg-white/5 text-neon-400'}`}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            <div className="p-4 md:p-10 max-w-7xl mx-auto pb-20">
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'clients' && <Clients onNavigateToSales={() => setCurrentView('sales')} />}
              {currentView === 'sales' && <Sales />}
              {currentView === 'accounting' && <Accounting />}
            </div>
          </main>
        </div>
      </StoreProvider>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;