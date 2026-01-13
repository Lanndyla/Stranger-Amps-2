import { useCallback, useRef, useState, useEffect } from 'react';

interface RotaryKnobProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export function RotaryKnob({
  value,
  min = 0,
  max = 10,
  step = 0.1,
  label,
  onChange,
  size = 'md',
  showValue = true,
}: RotaryKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);

  const sizeClasses = {
    sm: { outer: 'w-12 h-12', inner: 'w-8 h-8', indicator: 'w-0.5 h-3', text: 'text-xs' },
    md: { outer: 'w-16 h-16', inner: 'w-11 h-11', indicator: 'w-1 h-4', text: 'text-sm' },
    lg: { outer: 'w-20 h-20', inner: 'w-14 h-14', indicator: 'w-1 h-5', text: 'text-base' },
  };

  const { outer, inner, indicator, text } = sizeClasses[size];

  const normalizedValue = (value - min) / (max - min);
  const rotation = -135 + normalizedValue * 270;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  }, [value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY;
    const sensitivity = 0.5;
    const range = max - min;
    const deltaValue = (deltaY * sensitivity * range) / 100;
    
    let newValue = startValue + deltaValue;
    newValue = Math.max(min, Math.min(max, newValue));
    newValue = Math.round(newValue / step) * step;
    
    onChange(newValue);
  }, [isDragging, startY, startValue, min, max, step, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    const defaultValue = (min + max) / 2;
    onChange(Math.round(defaultValue / step) * step);
  }, [min, max, step, onChange]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -step : step;
    const newValue = Math.max(min, Math.min(max, value + delta * 5));
    onChange(Math.round(newValue / step) * step);
  }, [value, min, max, step, onChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col items-center gap-2" data-testid={`knob-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div
        ref={knobRef}
        className={`${outer} relative cursor-grab select-none ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        role="slider"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            const newValue = Math.min(max, value + step);
            onChange(Math.round(newValue / step) * step);
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            const newValue = Math.max(min, value - step);
            onChange(Math.round(newValue / step) * step);
          }
        }}
      >
        <div className={`${outer} rounded-full knob-body knob-shadow flex items-center justify-center`}>
          <div 
            className={`${inner} rounded-full knob-cap relative transition-transform duration-75`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div 
              className={`${indicator} absolute top-1 left-1/2 -translate-x-1/2 rounded-full bg-primary`}
              style={{ boxShadow: '0 0 6px 1px hsl(45 60% 50% / 0.5)' }}
            />
          </div>
        </div>
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 64 64">
          {Array.from({ length: 11 }, (_, i) => {
            const angle = -135 + i * 27;
            const rad = (angle * Math.PI) / 180;
            const x1 = 32 + Math.cos(rad) * 28;
            const y1 = 32 + Math.sin(rad) * 28;
            const x2 = 32 + Math.cos(rad) * 31;
            const y2 = 32 + Math.sin(rad) * 31;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(220 5% 40%)"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
                opacity={i % 5 === 0 ? 0.8 : 0.4}
              />
            );
          })}
        </svg>
      </div>
      
      <div className="text-center">
        <span className={`${text} font-semibold uppercase tracking-widest text-muted-foreground`}>
          {label}
        </span>
        {showValue && (
          <div className={`${text} font-mono text-primary mt-0.5`}>
            {value.toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
}
