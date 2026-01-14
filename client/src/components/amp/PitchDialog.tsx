import { Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ToggleSwitch } from './ToggleSwitch';
import { Slider } from '@/components/ui/slider';
import type { AmpSettings } from '@shared/schema';

interface PitchDialogProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
}

const pitchPresets = [
  { semitones: -12, label: '-1 OCT' },
  { semitones: -7, label: '-5th' },
  { semitones: -5, label: '-4th' },
  { semitones: -2, label: 'DROP' },
  { semitones: 0, label: 'OFF' },
  { semitones: 7, label: '+5th' },
  { semitones: 12, label: '+1 OCT' },
];

export function PitchDialog({ settings, onSettingsChange }: PitchDialogProps) {
  const getPitchLabel = (semitones: number) => {
    if (semitones === 0) return 'OFF';
    if (semitones === -12) return '-1 OCT';
    if (semitones === 12) return '+1 OCT';
    return semitones > 0 ? `+${semitones}` : `${semitones}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={settings.pitchEnabled && settings.pitchShift !== 0 ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5 font-mono text-xs"
          data-testid="button-pitch"
        >
          <Music className="w-3.5 h-3.5" />
          <span>PITCH</span>
          {settings.pitchEnabled && settings.pitchShift !== 0 && (
            <span className="text-[10px] font-bold">{getPitchLabel(settings.pitchShift)}</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wider text-blue-400 flex items-center gap-2">
            <Music className="w-5 h-5" />
            PITCH SHIFTER
          </DialogTitle>
          <DialogDescription className="sr-only">
            Pitch shifting and drop tuning effects
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Enable Pitch Shift
            </span>
            <ToggleSwitch
              isOn={settings.pitchEnabled}
              label=""
              onChange={(v) => onSettingsChange({ pitchEnabled: v })}
              variant="default"
              size="sm"
            />
          </div>

          <div className={`space-y-4 ${!settings.pitchEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="text-center">
              <span className="text-4xl font-bold font-mono text-blue-400">
                {getPitchLabel(settings.pitchShift)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">semitones</p>
            </div>

            <Slider
              value={[settings.pitchShift]}
              onValueChange={([v]) => onSettingsChange({ pitchShift: v })}
              min={-12}
              max={12}
              step={1}
              className="w-full"
              data-testid="slider-pitch"
            />

            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>-12</span>
              <span>0</span>
              <span>+12</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {pitchPresets.filter(p => p.semitones !== 0).map((preset) => (
                <Button
                  key={preset.semitones}
                  variant={settings.pitchShift === preset.semitones ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-mono"
                  onClick={() => onSettingsChange({ pitchShift: preset.semitones })}
                  data-testid={`button-pitch-preset-${preset.semitones}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <p className="text-[10px] text-muted-foreground text-center">
              Drop tune or add harmonies without retuning your guitar
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
