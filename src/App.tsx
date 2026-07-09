import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tag,
  Boxes,
  ShoppingBag,
  FileText,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  MessageCircleMore
} from 'lucide-react';

import DashboardView from './views/Dashboard';
import ChatbotView from './views/Chatbot';
import ProductosView from './views/Productos';
import InventarioView from './views/Inventario';
import VentasView from './views/Ventas';
import FacturasView from './views/Facturas';

const FloatingChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatbotView compact onClose={() => setOpen(false)} />}

      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-6 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/50 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-[0_18px_45px_rgba(251,146,60,0.38)] transition-transform duration-300 hover:scale-105 active:scale-95 md:bottom-8 md:right-6"
        aria-label={open ? 'Cerrar chatbot' : 'Abrir chatbot'}
      >
        <div className="absolute inset-0 rounded-full bg-white/15" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/15 backdrop-blur-sm">
          {open ? <X size={22} /> : <MessageCircleMore size={22} />}
        </div>
      </button>
    </>
  );
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('smartinventory_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('smartinventory_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    setRotation(prev => prev + 360);
  };

  const menuItems = [
    { name: 'Productos', path: '/', icon: Tag },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventario', path: '/inventario', icon: Boxes },
    { name: 'Punto de Venta (POS)', path: '/ventas', icon: ShoppingBag },
    { name: 'Facturas', path: '/facturas', icon: FileText }
  ];

  const currentRouteName = menuItems.find(item => item.path === location.pathname)?.name || 'No Es Shein, Pero Casi';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-[#161b26] border-r border-slate-200 dark:border-slate-800/60 transition-all duration-300 ${
          desktopCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800/60">
          {!desktopCollapsed && (
            <div className="leading-none">
              <span className="block font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 text-lg">
                No Es Shein,
              </span>
              <span className="block font-black tracking-tighter uppercase text-slate-800 dark:text-slate-100 text-sm">
                Pero Casi
              </span>
            </div>
          )}
          {desktopCollapsed && (
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 text-lg mx-auto">
              N
            </span>
          )}
          <button
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
          >
            {desktopCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 shadow-xs border-l-4 border-amber-500'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon size={20} className={isActive ? 'text-amber-500' : 'text-slate-400'} />
                {!desktopCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 text-center font-bold tracking-wider">
          {!desktopCollapsed ? 'NO ES SHEIN, PERO CASI | TREND STORE' : 'NESC'}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative flex w-72 max-w-xs flex-col bg-white dark:bg-[#161b26] border-r border-slate-200 dark:border-slate-800/60 p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4 mb-4">
              <div className="leading-none">
                <span className="block font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 text-lg">
                  No Es Shein,
                </span>
                <span className="block font-black tracking-tighter uppercase text-slate-800 dark:text-slate-100 text-sm">
                  Pero Casi
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs text-slate-400 text-center font-bold tracking-wider">
              NO ES SHEIN, PERO CASI
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-[#161b26] border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between px-6 z-10 flex-shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 md:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg md:text-xl tracking-tight">{currentRouteName}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-300 cursor-pointer active:scale-90 transition-all duration-300 flex items-center justify-center overflow-hidden"
              aria-label="Alternar modo de color"
            >
              <div
                style={{ transform: `rotate(${rotation}deg)` }}
                className="transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun size={18} className="text-amber-400" />
                ) : (
                  <Moon size={18} className="text-slate-600" />
                )}
              </div>
            </button>

            <span className="inline-flex items-center rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-500">
              Trend Store Admin
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <FloatingChatbot />
    </div>
  );
};

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<ProductosView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/inventario" element={<InventarioView />} />
          <Route path="/ventas" element={<VentasView />} />
          <Route path="/facturas" element={<FacturasView />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;