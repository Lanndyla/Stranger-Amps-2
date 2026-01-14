import { Waves } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotaryKnob } from './RotaryKnob';
import { ToggleSwitch } from './ToggleSwitch';
import type { AmpSettings } from '@shared/schema';

interface ReverbDialogProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
}

const reverbTypes = [
  { value: 'hall', label: 'HALL', description: 'Large cathedral space' },
  { value: 'room', label: 'ROOM', description: 'Natural studio room' },
  { value: 'plate', label: 'PLATE', description: 'Classic metal plate' },
  { value: 'spring', label: 'SPRING', description: 'Vintage amp spring' },
  { value: 'ambient', label: 'AMBIENT', description: 'Atmospheric wash' },
  { value: 'shimmer', label: 'SHIMMER', description: 'Ethereal octave verb' },
] as const;

export function ReverbDialog({ settings, onSettingsChange }: ReverbDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={settings.reverbEnabled ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5 font-mono text-xs"
          data-testid="button-reverb"
        >
          <Waves className="w-3.5 h-3.5" />
          <span>REVERB</span>
          {settings.reverbEnabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 led-glow-green" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wider text-primary flex items-center gap-2">
            <Waves className="w-5 h-5" />
            REVERB ENGINE
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure reverb settings for the amp
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Enable Reverb
            </span>
            <ToggleSwitch
              isOn={settings.reverbEnabled}
              label=""
              onChange={(v) => onSettingsChange({ reverbEnabled: v })}
              variant="default"
              size="sm"
            />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Reverb Type
            </span>
            <Select
              value={settings.reverbType}
              onValueChange={(val) => onSettingsChange({ reverbType: val as AmpSettings['reverbType'] })}
              disabled={!settings.reverbEnabled}
            >
              <SelectTrigger 
                className={`w-full bg-neutral-800 border-neutral-700 font-mono ${!settings.reverbEnabled ? 'opacity-50' : ''}`}
                data-testid="select-reverb-type"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                {reverbTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="font-mono">
                    <div className="flex flex-col">
                      <span className="font-semibold">{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={`flex items-center justify-center gap-8 py-4 ${!settings.reverbEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <RotaryKnob
              value={settings.reverbMix}
              label="MIX"
              onChange={(v) => onSettingsChange({ reverbMix: v })}
              size="md"
            />
            <RotaryKnob
              value={settings.reverbDecay}
              label="DECAY"
              onChange={(v) => onSettingsChange({ reverbDecay: v })}
              size="md"
            />
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <p className="text-[10px] text-muted-foreground text-center">
              Optimized for low-tuned extended range guitars
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
