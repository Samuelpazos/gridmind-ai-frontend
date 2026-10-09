import React from 'react';
import { useGrid } from '../context/GridContext';
import {
  LayoutDashboard,
  Network,
  Zap,
  Bell,
  TrendingUp,
  History,
  SlidersHorizontal,
  Wrench,
  Settings,
  BrainCircuit,
  Cpu,
  Activity,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: '1. Dashboard Tractian', icon: LayoutDashboard, tag: 'CORE' },
  { id: 'monitoring', label: '2. Monitoreo de Red', icon: Network, tag: 'SCADA' },
  { id: 'transformer-detail', label: '3. Detalle Transformador', icon: Zap, tag: 'IOT' },
  { id: 'alerts', label: '4. Centro de Alertas', icon: Bell, tag: 'LIVE' },
  { id: 'ranking', label: '5. Ranking de Riesgo', icon: TrendingUp, tag: 'AI' },
  { id: 'history', label: '6. Historial Audit', icon: History, tag: 'LOGS' },
  { id: 'simulator', label: '7. Simulador Fallas', icon: SlidersHorizontal, tag: 'LAB' },
  { id: 'maintenance', label: '8. Mantenimiento', icon: Wrench, tag: 'OPS' },
  { id: 'admin', label: '9. Administración', icon: Settings, tag: 'CONFIG' },
  { id: 'ai-config', label: '10. Configuración IA', icon: BrainCircuit, tag: 'AI' },
  { id: 'model-info', label: '11. Métricas Modelo', icon: Cpu, tag: 'SMILE' },
  { id: 'system-status', label: '12. Estado del Sistema', icon: Activity, tag: 'DIAG' }
];

const Sidebar = () => {
  const { activeTab, setActiveTab, alerts } = useGrid();
  const unackAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <aside className="w-68 tractian-card border-r border-cyan-500/30 flex flex-col justify-between shrink-0 select-none z-20">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-slate-950">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl glow-cyan-lg">
            <Zap className="h-7 w-7 fill-current animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-white tracking-wide font-mono flex items-center gap-1.5 text-glow-cyan">
              GridMind <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-[11px] text-cyan-300 font-mono font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-400 animate-spin" />
              Tractian Industrial IoT
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/30 via-blue-600/30 to-indigo-600/20 text-cyan-200 border-2 border-cyan-400 glow-cyan-lg font-black text-glow-cyan scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 hover:border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${isActive ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'}`}>
