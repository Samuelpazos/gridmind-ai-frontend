import React from 'react';

const StatusBadge = ({ status, size = 'normal' }) => {
  const s = (status || 'NORMAL').toUpperCase();

  let colors = 'bg-gradient-to-r from-emerald-950/90 to-emerald-900/80 text-emerald-300 border-emerald-400/60 glow-emerald-lg text-glow-emerald';
  if (s === 'WARNING' || s === 'MEDIUM') {
    colors = 'bg-gradient-to-r from-amber-950/90 to-amber-900/80 text-amber-300 border-amber-400/60 glow-amber-lg text-glow-amber';
  } else if (s === 'CRITICAL' || s === 'HIGH') {
    colors = 'bg-gradient-to-r from-rose-950/90 to-rose-900/80 text-rose-300 border-rose-500/70 glow-crimson-lg text-glow-crimson';
  } else if (s === 'FAILED') {
    colors = 'bg-gradient-to-r from-red-950 to-rose-950 text-white border-red-500 font-extrabold shadow-lg shadow-red-950/80 animate-pulse text-glow-crimson';
  }

  const padding = size === 'sm' ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border font-mono font-black tracking-wider shadow-md ${padding} ${colors}`}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current"></span>
      </span>
      {s}
    </span>
  );
};

export default StatusBadge;
