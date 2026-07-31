import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export function ConfettiBlast({ trigger, origin }) {
  // We no longer need this dummy component because canvas-confetti handles its own canvas.
  return null;
}

// Convenience hook to fire confetti from any component
export function useConfetti() {
  const fireConfetti = useCallback((e) => {
    let origin = { x: 0.5, y: 0.5 };
    if (e && e.clientX && e.clientY) {
      origin = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
    }

    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999, origin };

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: origin.x + Math.random() * 0.2 - 0.1, y: origin.y - Math.random() * 0.2 } });
    }, 250);
  }, []);

  return { ConfettiComponent: () => null, fireConfetti };
}
