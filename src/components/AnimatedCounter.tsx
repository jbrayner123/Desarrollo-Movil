// parcial-02/src/components/AnimatedCounter.tsx
import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 600 }) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const change = value - startValue;

    if (change === 0) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + change * ease));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span className="font-mono">{displayValue}</span>;
};
