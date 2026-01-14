import { useState, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { AmpSettings } from '@shared/schema';

interface DelayPedalDialogProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
}

interface PedalKnobProps {
  value: number;
  label: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

function PedalKnob({ value, label, min, max, onChange, formatValue }: PedalKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = value;
    e.preventDefault();

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startY.current - e.clientY;
      const range = max - min;
      const newValue = Math.max(min, Math.min(max, startValue.current + (delta / 100) * range));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [value, min, max, onChange]);

  const normalizedValue = (value - min) / (max - min);
  const rotation = -135 + normalizedValue * 270;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={knobRef}
        className="relative w-14 h-14 cursor-pointer select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-neutral-600 to-neutral-800 shadow-lg border border-neutral-500/30">
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-900">
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-2 w-1 h-3 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-neutral-700 rounded-full" />
      </div>
      <span className="text-[10px] font-bold tracking-wider text-blue-300 uppercase">{label}</span>
      <span className="text-[9px] font-mono text-neutral-400">
        {formatValue ? formatValue(value) : value.toFixed(0)}
      </span>
    </div>
  );
}

export function DelayPedalDialog({ settings, onSettingsChange }: DelayPedalDialogProps) {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const lastTapRef = useRef<number>(0);

  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap > 2000) {
      setTapTimes([now]);
    } else {
      const newTapTimes = [...tapTimes, now].slice(-4);
      setTapTimes(newTapTimes);
      
      if (newTapTimes.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < newTapTimes.length; i++) {
          intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const clampedTime = Math.max(50, Math.min(2000, avgInterval));
        onSettingsChange({ delayTime: clampedTime });
      }
    }
    
    lastTapRef.current = now;
  }, [tapTimes, onSettingsChange]);

  const formatTime = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${Math.round(ms)}ms`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={settings.delayEnabled ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5 font-mono text-xs"
          data-testid="button-delay-pedal"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>DELAY</span>
          {settings.delayEnabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.6)' }} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 max-w-sm p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Delay Pedal</DialogTitle>
          <DialogDescription>
            Digital delay pedal with tap tempo
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <div 
            className="relative p-6 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, #4b5563 0%, #374151 50%, #1f2937 100%)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-neutral-800 border border-neutral-600" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-neutral-800 border border-neutral-600" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-neutral-800 border border-neutral-600" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-neutral-800 border border-neutral-600" />

            <div className="text-center mb-4">
              <div className="inline-block px-4 py-1 bg-neutral-800/80 rounded border border-neutral-600/50">
                <span className="text-lg font-black tracking-wider text-blue-400" style={{ textShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }}>
                  DELAY
                </span>
              </div>
              <div className="text-[9px] font-mono text-neutral-500 mt-1 tracking-widest">
                STRANGER AMPS
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mb-6">
              <PedalKnob
                value={settings.delayTime}
                label="TIME"
                min={50}
                max={2000}
                onChange={(v) => onSettingsChange({ delayTime: v })}
                formatValue={formatTime}
              />
              <PedalKnob
                value={settings.delayFeedback}
                label="REGEN"
                min={0}
                max={10}
                onChange={(v) => onSettingsChange({ delayFeedback: v })}
              />
              <PedalKnob
                value={settings.delayMix}
                label="MIX"
                min={0}
                max={10}
                onChange={(v) => onSettingsChange({ delayMix: v })}
              />
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTapTempo}
                className="h-10 px-6 bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-blue-300 font-bold tracking-wider"
                data-testid="button-tap-tempo"
              >
                TAP TEMPO
              </Button>
            </div>

            <div 
              className="mx-auto w-20 h-20 rounded-full cursor-pointer transition-transform active:scale-95"
              style={{
                background: settings.delayEnabled 
                  ? 'radial-gradient(circle at 30% 30%, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)'
                  : 'radial-gradient(circle at 30% 30%, #6b7280 0%, #4b5563 50%, #374151 100%)',
                boxShadow: settings.delayEnabled 
                  ? '0 4px 15px rgba(59, 130, 246, 0.5), inset 0 2px 4px rgba(255,255,255,0.2)' 
                  : '0 4px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)',
              }}
              onClick={() => onSettingsChange({ delayEnabled: !settings.delayEnabled })}
              data-testid="button-delay-footswitch"
            >
              <div className="w-full h-full flex items-center justify-center">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: settings.delayEnabled ? '#22c55e' : '#374151',
                    boxShadow: settings.delayEnabled ? '0 0 15px 5px rgba(34, 197, 94, 0.7)' : 'none',
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 rounded-sm bg-neutral-700 border border-neutral-600" />
                <span className="text-[8px] text-neutral-500 font-mono">IN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-neutral-500 font-mono">OUT</span>
                <div className="w-4 h-2 rounded-sm bg-neutral-700 border border-neutral-600" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
