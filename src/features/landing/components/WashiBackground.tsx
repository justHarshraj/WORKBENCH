import { useMemo } from 'react';

/**
 * Washi paper background with fog layers, floating particles, and film grain.
 * Everything at extremely low opacity — almost invisible, but adds depth.
 */
export function WashiBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${15 + Math.random() * 20}s`,
      delay: `${Math.random() * 10}s`,
      driftX: `${(Math.random() - 0.5) * 60}px`,
      driftY: `${-50 - Math.random() * 150}px`,
      maxOpacity: 0.08 + Math.random() * 0.1,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  return (
    <>
      {/* Base washi paper texture */}
      <div className="washi-texture" aria-hidden="true" />

      {/* Fog layers */}
      <div
        className="fog-layer fog-layer--1"
        style={{ top: '20%' }}
        aria-hidden="true"
      />
      <div
        className="fog-layer fog-layer--2"
        style={{ top: '50%' }}
        aria-hidden="true"
      />
      <div
        className="fog-layer fog-layer--3"
        style={{ top: '35%' }}
        aria-hidden="true"
      />

      {/* Floating dust particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          aria-hidden="true"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--duration': p.duration,
            '--delay': p.delay,
            '--drift-x': p.driftX,
            '--drift-y': p.driftY,
            '--max-opacity': p.maxOpacity,
          } as React.CSSProperties}
        />
      ))}

      {/* Film grain overlay */}
      <div className="film-grain" aria-hidden="true" />
    </>
  );
}
