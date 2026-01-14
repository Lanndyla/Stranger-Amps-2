import { useEffect, useRef, useCallback, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { AmpSettings } from '@shared/schema';

interface ParametricEQDialogProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
}

interface Band {
  freq: number;
  gain: number;
  q: number;
  color: string;
  label: string;
  index: number;
}

function freqToX(freq: number, width: number): number {
  const minLog = Math.log10(20);
  const maxLog = Math.log10(20000);
  return ((Math.log10(freq) - minLog) / (maxLog - minLog)) * width;
}

function gainToY(gain: number, height: number): number {
  return height / 2 - (gain / 12) * (height / 2 - 20);
}

function xToFreq(x: number, width: number): number {
  const minLog = Math.log10(20);
  const maxLog = Math.log10(20000);
  const logFreq = (x / width) * (maxLog - minLog) + minLog;
  return Math.max(20, Math.min(20000, Math.pow(10, logFreq)));
}

function yToGain(y: number, height: number): number {
  const gain = ((height / 2 - y) / (height / 2 - 20)) * 12;
  return Math.max(-12, Math.min(12, gain));
}

function calculateBandResponse(freq: number, band: Band): number {
  const sampleRate = 48000;
  const w0 = (2 * Math.PI * band.freq) / sampleRate;
  const A = Math.pow(10, band.gain / 40);
  const alpha = Math.sin(w0) / (2 * band.q);
  
  const b0 = 1 + alpha * A;
  const b1 = -2 * Math.cos(w0);
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * Math.cos(w0);
  const a2 = 1 - alpha / A;
  
  const omega = (2 * Math.PI * freq) / sampleRate;
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);
  const cos2W = Math.cos(2 * omega);
  const sin2W = Math.sin(2 * omega);
  
  const numReal = (b0/a0) + (b1/a0) * cosW + (b2/a0) * cos2W;
  const numImag = -(b1/a0) * sinW - (b2/a0) * sin2W;
  const denReal = 1 + (a1/a0) * cosW + (a2/a0) * cos2W;
  const denImag = -(a1/a0) * sinW - (a2/a0) * sin2W;
  
  const numMagSq = numReal * numReal + numImag * numImag;
  const denMagSq = denReal * denReal + denImag * denImag;
  const mag = Math.sqrt(numMagSq / Math.max(denMagSq, 1e-10));
  
  return 20 * Math.log10(Math.max(0.001, mag));
}

interface EQVisualizationProps {
  bands: Band[];
  enabled: boolean;
  onBandChange: (bandIndex: number, freq: number, gain: number) => void;
}

function EQVisualization({ bands, enabled, onBandChange }: EQVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingBand, setDraggingBand] = useState<number | null>(null);
  const [hoveredBand, setHoveredBand] = useState<number | null>(null);
  
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);
  
  const findBandAtPosition = useCallback((x: number, y: number): number | null => {
    if (!enabled) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    for (let i = bands.length - 1; i >= 0; i--) {
      const band = bands[i];
      const bandX = freqToX(band.freq, canvas.width);
      let totalGain = 0;
      bands.forEach(b => {
        totalGain += calculateBandResponse(band.freq, b);
      });
      const bandY = gainToY(totalGain, canvas.height);
      
      const dist = Math.sqrt((x - bandX) ** 2 + (y - bandY) ** 2);
      if (dist <= 12) return i;
    }
    return null;
  }, [bands, enabled]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enabled) return;
    const { x, y } = getCanvasCoords(e);
    const bandIndex = findBandAtPosition(x, y);
    if (bandIndex !== null) {
      setDraggingBand(bandIndex);
      e.preventDefault();
    }
  }, [enabled, getCanvasCoords, findBandAtPosition]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { x, y } = getCanvasCoords(e);
    
    if (draggingBand !== null && enabled) {
      const newFreq = xToFreq(x, canvas.width);
      const newGain = yToGain(y, canvas.height);
      onBandChange(draggingBand, newFreq, newGain);
    } else {
      const hovered = findBandAtPosition(x, y);
      setHoveredBand(hovered);
    }
  }, [draggingBand, enabled, getCanvasCoords, findBandAtPosition, onBandChange]);
  
  const handleMouseUp = useCallback(() => {
    setDraggingBand(null);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredBand(null);
  }, []);
  
  useEffect(() => {
    if (draggingBand !== null) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || !enabled) return;
        
        const { x, y } = getCanvasCoords(e);
        const newFreq = xToFreq(x, canvas.width);
        const newGain = yToGain(y, canvas.height);
        onBandChange(draggingBand, newFreq, newGain);
      };
      
      const handleGlobalMouseUp = () => {
        setDraggingBand(null);
      };
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggingBand, enabled, getCanvasCoords, onBandChange]);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].forEach(freq => {
      const x = freqToX(freq, width);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });
    
    [-12, -6, 0, 6, 12].forEach(gain => {
      const y = gainToY(gain, height);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });
    
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    [100, 1000, 10000].forEach(freq => {
      const x = freqToX(freq, width);
      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
      ctx.fillText(label, x, height - 4);
    });
    
    ctx.textAlign = 'right';
    [-12, -6, 0, 6, 12].forEach(gain => {
      const y = gainToY(gain, height);
      ctx.fillText(`${gain > 0 ? '+' : ''}${gain}dB`, width - 4, y + 3);
    });
    
    if (enabled) {
      bands.forEach(band => {
        ctx.strokeStyle = band.color + '60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let px = 0; px < width; px++) {
          const logFreq = (px / width) * (Math.log10(20000) - Math.log10(20)) + Math.log10(20);
          const freq = Math.pow(10, logFreq);
          const response = calculateBandResponse(freq, band);
          const y = gainToY(response, height);
          
          if (px === 0) {
            ctx.moveTo(px, y);
          } else {
            ctx.lineTo(px, y);
          }
        }
        ctx.stroke();
      });
    }
    
    ctx.strokeStyle = enabled ? '#f97316' : '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let px = 0; px < width; px++) {
      const logFreq = (px / width) * (Math.log10(20000) - Math.log10(20)) + Math.log10(20);
      const freq = Math.pow(10, logFreq);
      
      let totalResponse = 0;
      if (enabled) {
        bands.forEach(band => {
          totalResponse += calculateBandResponse(freq, band);
        });
      }
      
      const y = gainToY(totalResponse, height);
      
      if (px === 0) {
        ctx.moveTo(px, y);
      } else {
        ctx.lineTo(px, y);
      }
    }
    ctx.stroke();
    
    if (enabled) {
      bands.forEach((band, idx) => {
        const x = freqToX(band.freq, width);
        let totalGain = 0;
        bands.forEach(b => {
          totalGain += calculateBandResponse(band.freq, b);
        });
        const y = gainToY(totalGain, height);
        
        const isActive = draggingBand === idx || hoveredBand === idx;
        const radius = isActive ? 10 : 8;
        
        if (isActive) {
          ctx.fillStyle = band.color + '40';
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fillStyle = band.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(band.label, x, y + 3);
      });
    }
  }, [bands, enabled, draggingBand, hoveredBand]);
  
  useEffect(() => {
    draw();
  }, [draw]);
  
  const cursorStyle = enabled && (hoveredBand !== null || draggingBand !== null) ? 'grab' : 'default';
  
  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={180}
      className="w-full rounded-lg border border-neutral-700"
      style={{ cursor: draggingBand !== null ? 'grabbing' : cursorStyle }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      data-testid="canvas-peq-visualization"
    />
  );
}

export function ParametricEQDialog({ settings, onSettingsChange }: ParametricEQDialogProps) {
  const bands: Band[] = [
    { freq: settings.peqBand1Freq, gain: settings.peqBand1Gain, q: settings.peqBand1Q, color: '#ef4444', label: '1', index: 1 },
    { freq: settings.peqBand2Freq, gain: settings.peqBand2Gain, q: settings.peqBand2Q, color: '#eab308', label: '2', index: 2 },
    { freq: settings.peqBand3Freq, gain: settings.peqBand3Gain, q: settings.peqBand3Q, color: '#22c55e', label: '3', index: 3 },
    { freq: settings.peqBand4Freq, gain: settings.peqBand4Gain, q: settings.peqBand4Q, color: '#3b82f6', label: '4', index: 4 },
  ];
  
  const handleBandChange = useCallback((bandIndex: number, freq: number, gain: number) => {
    const bandNum = bandIndex + 1;
    onSettingsChange({
      [`peqBand${bandNum}Freq`]: freq,
      [`peqBand${bandNum}Gain`]: gain,
    });
  }, [onSettingsChange]);
  
  const formatFreq = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(freq >= 10000 ? 0 : 1)}kHz`;
    }
    return `${Math.round(freq)}Hz`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={settings.peqEnabled ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5 font-mono text-xs"
          data-testid="button-parametric-eq"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>PEQ</span>
          {settings.peqEnabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" style={{ boxShadow: '0 0 8px 2px rgba(251, 146, 60, 0.6)' }} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wider text-orange-400 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            PARAMETRIC EQ
          </DialogTitle>
          <DialogDescription className="sr-only">
            4-band parametric equalizer with visual frequency response
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Enable Parametric EQ</Label>
            <Switch
              checked={settings.peqEnabled}
              onCheckedChange={(v) => onSettingsChange({ peqEnabled: v })}
              data-testid="switch-peq-enabled"
            />
          </div>
          
          <EQVisualization bands={bands} enabled={settings.peqEnabled} onBandChange={handleBandChange} />
          
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((bandNum) => {
              const freq = settings[`peqBand${bandNum}Freq` as keyof AmpSettings] as number;
              const gain = settings[`peqBand${bandNum}Gain` as keyof AmpSettings] as number;
              const q = settings[`peqBand${bandNum}Q` as keyof AmpSettings] as number;
              const color = bands[bandNum - 1].color;
              
              return (
                <div
                  key={bandNum}
                  className="p-2 rounded-lg bg-neutral-800/50 space-y-2"
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <div className="text-center text-xs font-bold" style={{ color }}>
                    Band {bandNum}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>FREQ</span>
                      <span className="font-mono">{formatFreq(freq)}</span>
                    </div>
                    <Slider
                      value={[Math.log10(freq)]}
                      min={Math.log10(20)}
                      max={Math.log10(20000)}
                      step={0.01}
                      onValueChange={([v]) => onSettingsChange({ [`peqBand${bandNum}Freq`]: Math.pow(10, v) })}
                      className="h-4"
                      disabled={!settings.peqEnabled}
                      data-testid={`slider-peq-band${bandNum}-freq`}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>GAIN</span>
                      <span className="font-mono">{gain > 0 ? '+' : ''}{gain.toFixed(1)}dB</span>
                    </div>
                    <Slider
                      value={[gain]}
                      min={-12}
                      max={12}
                      step={0.5}
                      onValueChange={([v]) => onSettingsChange({ [`peqBand${bandNum}Gain`]: v })}
                      className="h-4"
                      disabled={!settings.peqEnabled}
                      data-testid={`slider-peq-band${bandNum}-gain`}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Q</span>
                      <span className="font-mono">{q.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[q]}
                      min={0.1}
                      max={10}
                      step={0.1}
                      onValueChange={([v]) => onSettingsChange({ [`peqBand${bandNum}Q`]: v })}
                      className="h-4"
                      disabled={!settings.peqEnabled}
                      data-testid={`slider-peq-band${bandNum}-q`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
