import { useEffect, useState, useRef } from 'react';

interface GainMeterProps {
  level: number;
  isClipping?: boolean;
  label?: string;
}

export function GainMeter({ level, isClipping = false, label = 'LEVEL' }: GainMeterProps) {
  const [smoothedLevel, setSmoothedLevel] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      setSmoothedLevel(prev => {
        const diff = level - prev;
        const attack = 0.3;
        const release = 0.1;
        const rate = diff > 0 ? attack : release;
        return prev + diff * rate;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [level]);

  const segments = 12;
  const activeSegments = Math.round((smoothedLevel / 100) * segments);

  return (
    <div className="flex flex-col items-center gap-2" data-testid="gain-meter">
      <div className="flex flex-col-reverse gap-0.5 p-2 rounded bg-neutral-900/50 border border-neutral-800">
        {Array.from({ length: segments }, (_, i) => {
          const isActive = i < activeSegments;
          const isRed = i >= segments - 2;
          const isYellow = i >= segments - 5 && i < segments - 2;
          
          let bgColor = 'bg-neutral-800';
          if (isActive) {
            if (isRed) {
              bgColor = 'bg-red-500';
            } else if (isYellow) {
              bgColor = 'bg-amber-500';
            } else {
              bgColor = 'bg-green-500';
            }
          }
          
          return (
            <div
              key={i}
              className={`w-4 h-1.5 rounded-sm transition-colors duration-75 ${bgColor}`}
              style={{
                boxShadow: isActive 
                  ? isRed 
                    ? '0 0 4px rgba(239, 68, 68, 0.5)'
                    : isYellow
                      ? '0 0 4px rgba(245, 158, 11, 0.5)'
                      : '0 0 4px rgba(34, 197, 94, 0.5)'
                  : 'none',
              }}
            />
          );
        })}
      </div>
      
      {isClipping && (
        <div className="w-3 h-3 rounded-full bg-red-500 led-glow-red animate-pulse" />
      )}
      
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
