import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// SVG Radar Chart Component (No external libraries required)
// ─────────────────────────────────────────────────────────────────────────────
export function RadarChart({ data, size = 280 }) {
  const center = size / 2;
  const radius = (size / 2) - 40; 
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const valRatio = Math.max(0.1, d.value / (d.fullMark || 1));
    return {
      x: center + radius * valRatio * Math.cos(angle),
      y: center + radius * valRatio * Math.sin(angle),
      labelX: center + (radius + 25) * Math.cos(angle),
      labelY: center + (radius + 20) * Math.sin(angle),
      label: d.label,
      valRatio
    };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Generate web background
  const webs = [0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => {
    const p = data.map((_, j) => {
      const angle = j * angleStep - Math.PI / 2;
      return `${j === 0 ? 'M' : 'L'} ${center + radius * scale * Math.cos(angle)} ${center + radius * scale * Math.sin(angle)}`;
    }).join(' ') + ' Z';
    return <path key={i} d={p} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray={scale === 1 ? "0" : "2 4"} />;
  });

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {webs}
        
        {/* Axis lines */}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line key={`axis-${i}`} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="var(--border)" strokeWidth="1" />
          );
        })}

        {/* Data Polygon */}
        <path d={polygonPath} fill="url(#radarFill)" stroke="var(--primary)" strokeWidth="2.5" filter="url(#glow)" className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
        
        {/* Data Points */}
        {points.map((p, i) => (
          <circle key={`pt-${i}`} cx={p.x} cy={p.y} r="5" fill="var(--bg)" stroke="var(--primary)" strokeWidth="2" className="transition-all duration-1000 ease-in-out" />
        ))}

        {/* Labels */}
        {points.map((p, i) => {
          const words = p.label.split(' ');
          return (
            <text key={`lbl-${i}`} x={p.labelX} y={p.labelY} fill="var(--text)" fontSize="12" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
              {words.length > 1 ? (
                <>
                  <tspan x={p.labelX} dy="-0.4em">{words[0]}</tspan>
                  <tspan x={p.labelX} dy="1.2em">{words.slice(1).join(' ')}</tspan>
                </>
              ) : (
                <tspan x={p.labelX} dy="0">{words[0]}</tspan>
              )}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
