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
