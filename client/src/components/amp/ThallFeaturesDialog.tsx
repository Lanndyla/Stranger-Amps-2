import { Layers, Zap, Radio, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotaryKnob } from './RotaryKnob';
import { ToggleSwitch } from './ToggleSwitch';
import type { AmpSettings } from '@shared/schema';

interface ThallFeaturesDialogProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
}

export function ThallFeaturesDialog({ settings, onSettingsChange }: ThallFeaturesDialogProps) {
  const hasActiveFeature = settings.thickenEnabled || settings.chugEnabled || settings.lofi || settings.cleanse;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={hasActiveFeature ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5 font-mono text-xs"
          data-testid="button-thall-features"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>THALL</span>
          {hasActiveFeature && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" style={{ boxShadow: '0 0 8px 2px rgba(251, 146, 60, 0.6)' }} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wider text-orange-400 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            THALL FEATURES
          </DialogTitle>
          <DialogDescription className="sr-only">
            Advanced tone shaping features for ultra-heavy tones
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-orange-400" />
                <div>
                  <span className="text-sm font-semibold">THICKEN</span>
                  <p className="text-[10px] text-muted-foreground">Sub-octave blend for massive low-end</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={!settings.thickenEnabled ? 'opacity-50 pointer-events-none' : ''}>
                  <RotaryKnob
                    value={settings.thicken}
                    label=""
                    onChange={(v) => onSettingsChange({ thicken: v })}
                    size="sm"
                  />
                </div>
                <ToggleSwitch
                  isOn={settings.thickenEnabled}
                  label=""
                  onChange={(v) => onSettingsChange({ thickenEnabled: v })}
                  variant="default"
                  size="sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <div>
                  <span className="text-sm font-semibold">CHUG ENHANCER</span>
                  <p className="text-[10px] text-muted-foreground">Dynamic mid-boost on pick attack</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={!settings.chugEnabled ? 'opacity-50 pointer-events-none' : ''}>
                  <RotaryKnob
                    value={settings.chugEnhance}
                    label=""
                    onChange={(v) => onSettingsChange({ chugEnhance: v })}
                    size="sm"
                  />
                </div>
                <ToggleSwitch
                  isOn={settings.chugEnabled}
                  label=""
                  onChange={(v) => onSettingsChange({ chugEnabled: v })}
                  variant="default"
                  size="sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-sm font-semibold">LO-FI</span>
                  <p className="text-[10px] text-muted-foreground">Bandpass filter for atmospheric breakdowns</p>
                </div>
              </div>
              <ToggleSwitch
                isOn={settings.lofi}
                label=""
                onChange={(v) => onSettingsChange({ lofi: v })}
                variant="default"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-green-400" />
                <div>
                  <span className="text-sm font-semibold">CLEANSE</span>
                  <p className="text-[10px] text-muted-foreground">Remove heavy distortion for clean tones</p>
                </div>
              </div>
              <ToggleSwitch
                isOn={settings.cleanse}
                label=""
                onChange={(v) => onSettingsChange({ cleanse: v })}
                variant="default"
                size="sm"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <p className="text-[10px] text-muted-foreground text-center">
              Stack multiple effects for unique djent textures
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
