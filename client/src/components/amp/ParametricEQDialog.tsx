import { useEffect, useRef, useCallback } from 'react';
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
}

function freqToX(freq: number, width: number): number {
  const minLog = Math.log10(20);
  const maxLog = Math.log10(20000);
  return ((Math.log10(freq) - minLog) / (maxLog - minLog)) * width;
}

function gainToY(gain: number, height: number): number {
  return height / 2 - (gain / 12) * (height / 2 - 20);
}

function calculateBandResponse(freq: number, band: Band): number {
  const omega = (2 * Math.PI * freq) / 48000;
  const A = Math.pow(10, band.gain / 40);
  const omega0 = (2 * Math.PI * band.freq) / 48000;
  const alpha = Math.sin(omega0) / (2 * band.q);
  
  const cosOmega = Math.cos(omega);
  const cosOmega0 = Math.cos(omega0);
  
  const b0 = 1 + alpha * A;
  const b1 = -2 * cosOmega0;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * cosOmega0;
  const a2 = 1 - alpha / A;
  
  const realNum = (b0 / a0) * Math.cos(0) + (b1 / a0) * cosOmega + (b2 / a0) * Math.cos(2 * omega);
  const imagNum = -(b0 / a0) * Math.sin(0) - (b1 / a0) * Math.sin(omega) - (b2 / a0) * Math.sin(2 * omega);
  const realDen = 1 + (a1 / a0) * cosOmega + (a2 / a0) * Math.cos(2 * omega);
  const imagDen = -(a1 / a0) * Math.sin(omega) - (a2 / a0) * Math.sin(2 * omega);
  
  const mag = Math.sqrt((realNum * realNum + imagNum * imagNum) / (realDen * realDen + imagDen * imagDen));
  return 20 * Math.log10(Math.max(0.001, mag));
}

function EQVisualization({ bands, enabled }: { bands: Band[]; enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
      bands.forEach(band => {
        const x = freqToX(band.freq, width);
        let totalGain = 0;
        bands.forEach(b => {
          totalGain += calculateBandResponse(band.freq, b);
        });
        const y = gainToY(totalGain, height);
        
        ctx.fillStyle = band.color;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(band.label, x, y + 3);
      });
    }
  }, [bands, enabled]);
  
  useEffect(() => {
    draw();
  }, [draw]);
  
  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={180}
      className="w-full rounded-lg border border-neutral-700"
      data-testid="canvas-peq-visualization"
    />
  );
}

export function ParametricEQDialog({ settings, onSettingsChange }: ParametricEQDialogProps) {
  const bands: Band[] = [
    { freq: settings.peqBand1Freq, gain: settings.peqBand1Gain, q: settings.peqBand1Q, color: '#ef4444', label: '1' },
    { freq: settings.peqBand2Freq, gain: settings.peqBand2Gain, q: settings.peqBand2Q, color: '#eab308', label: '2' },
    { freq: settings.peqBand3Freq, gain: settings.peqBand3Gain, q: settings.peqBand3Q, color: '#22c55e', label: '3' },
    { freq: settings.peqBand4Freq, gain: settings.peqBand4Gain, q: settings.peqBand4Q, color: '#3b82f6', label: '4' },
  ];
  
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
          
          <EQVisualization bands={bands} enabled={settings.peqEnabled} />
          
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
