import React from 'react';
import { useGrid } from '../context/GridContext';
import { Zap, Globe, Phone, User, Play, Bell } from 'lucide-react';

const navTabs = [
  { id: 'dashboard', label: 'Inicio' },
  { id: 'monitoring', label: 'Monitoreo en Tiempo Real' },
  { id: 'transformer-detail', label: 'Salud de Activos' },
  { id: 'alerts', label: 'Alertas & Paros' },
  { id: 'ranking', label: 'Ranking de Riesgo' },
  { id: 'simulator', label: 'Laboratorio What-If' },
  { id: 'maintenance', label: 'Mantenimiento' },
  { id: 'model-info', label: 'IA & Diagnóstico' }
];

const Header = () => {
  const { activeTab, setActiveTab, alerts, summary } = useGrid();
  const unackAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="tractian-nav sticky top-0 z-50 px-8 py-3 flex items-center justify-between font-sans">
      {/* Brand Logo */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 text-white font-extrabold text-xl tracking-wider font-mono bg-transparent border-none cursor-pointer"
        >
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/50">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span>GRIDMIND<span className="text-cyan-400">.AI</span></span>
        </button>

        {/* Top Navbar Menu */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navTabs.slice(0, 6).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`bg-transparent border-none cursor-pointer text-sm font-semibold transition-colors py-1 border-b-2 ${
                activeTab === tab.id
                  ? 'text-white border-blue-500 font-bold'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Header Actions (Tractian Style) */}
      <div className="flex items-center gap-5 text-sm">
        <div className="hidden md:flex items-center gap-4 text-slate-400 font-medium text-xs">
          <span className="flex items-center gap-1 cursor-pointer hover:text-white">
            <Globe className="h-4 w-4" /> ES
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-white">
            <Phone className="h-4 w-4" /> Soporte 24/7
          </span>
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 cursor-pointer hover:border-slate-700"
          >
            <Bell className="h-4 w-4 text-rose-400" />
            <span>Alertas</span>
            {unackAlertsCount > 0 && (
              <span className="bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full text-[10px] animate-pulse">
                {unackAlertsCount}
              </span>
            )}
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setActiveTab('simulator')}
          className="btn-tractian-primary text-xs tracking-wide uppercase"
        >
          <Play className="h-4 w-4 fill-current" />
          Solicita una Demo / Simulación
        </button>
      </div>
    </header>
  );
};

export default Header;
