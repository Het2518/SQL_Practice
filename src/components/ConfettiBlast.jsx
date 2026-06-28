import { useState, useEffect, useRef } from 'react';

const COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#ff922b', '#cc5de8', '#20c997', '#f06595',
  '#74c0fc', '#ffe066',
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function Particle({ x, y }) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = randomBetween(6, 14);
  const angle = randomBetween(0, 360);
  const velocity = randomBetween(200, 500);
  const vx = Math.cos((angle * Math.PI) / 180) * velocity;
  const vy = Math.sin((angle * Math.PI) / 180) * velocity - 200; // bias upward
  const rotation = randomBetween(-720, 720);
  const shape = Math.random() > 0.5 ? 'circle' : 'rect';
  const duration = randomBetween(0.8, 1.4);

  const style = {
    position: 'fixed',
    left: x,
    top: y,
    width: shape === 'circle' ? size : size * randomBetween(0.5, 1.5),
    height: size,
    borderRadius: shape === 'circle' ? '50%' : randomBetween(0, 4),
    background: color,
    pointerEvents: 'none',
    zIndex: 99998,
    animation: `confetti-particle ${duration}s ease-out forwards`,
    '--vx': `${vx}px`,
    '--vy': `${vy}px`,
    '--rot': `${rotation}deg`,
  };

  return <div style={style} />;
}

export function ConfettiBlast({ trigger, origin }) {
  const [particles, setParticles] = useState([]);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!trigger) return;

    const ox = origin?.x ?? window.innerWidth / 2;
    const oy = origin?.y ?? window.innerHeight / 2;

    const count = 80;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: ++counterRef.current,
      x: ox,
      y: oy,
    }));
    setParticles(newParticles);

    const timeout = setTimeout(() => setParticles([]), 1600);
    return () => clearTimeout(timeout);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes confetti-particle {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--vx), calc(var(--vy) + 600px)) rotate(var(--rot)) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
      {particles.map(p => (
        <Particle key={p.id} x={p.x} y={p.y} />
      ))}
    </>
  );
}

// Convenience hook to fire confetti from any component
export function useConfetti() {
  const [blast, setBlast] = useState(null);

  const fire = (e) => {
    const origin = e
      ? { x: e.clientX ?? window.innerWidth / 2, y: e.clientY ?? window.innerHeight / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 3 };
    setBlast({ ts: Date.now(), origin });
    setTimeout(() => setBlast(null), 100);
  };

  const node = blast ? (
    <ConfettiBlast trigger={blast.ts} origin={blast.origin} />
  ) : null;

  return { fire, node };
}
