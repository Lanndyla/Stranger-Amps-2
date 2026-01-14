import { RotaryKnob } from './RotaryKnob';
import { GainMeter } from './GainMeter';
import type { AmpSettings } from '@shared/schema';

interface LeftControlPanelProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
  inputLevel?: number;
  isClipping?: boolean;
}

export function LeftControlPanel({
  settings,
  onSettingsChange,
  inputLevel = 0,
  isClipping = false,
}: LeftControlPanelProps) {
  return (
    <div 
      className="flex flex-col h-full amp-panel rounded-lg border border-neutral-800 overflow-hidden"
      data-testid="left-control-panel"
    >
      <div className="px-4 py-3 bg-neutral-900/80 border-b border-neutral-800">
        <span className="text-sm font-bold tracking-[0.3em] text-primary uppercase">INPUT / EQ</span>
      </div>

      <div className="flex-1 flex flex-col gap-5 p-4">
        <div className="flex items-center justify-center gap-4">
          <RotaryKnob
            value={settings.inputLevel}
            label="INPUT"
            onChange={(v) => onSettingsChange({ inputLevel: v })}
            size="sm"
          />
          <RotaryKnob
            value={settings.inputGain}
            label="GAIN"
            onChange={(v) => onSettingsChange({ inputGain: v })}
            size="md"
          />
          <div className="flex flex-col items-center gap-1">
            <GainMeter level={inputLevel} isClipping={isClipping} />
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">LVL</span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

        <div className="grid grid-cols-2 gap-4 place-items-center">
          <RotaryKnob
            value={settings.bass}
            label="BASS"
            onChange={(v) => onSettingsChange({ bass: v })}
            size="sm"
          />
          <RotaryKnob
            value={settings.mid}
            label="MID"
            onChange={(v) => onSettingsChange({ mid: v })}
            size="sm"
          />
          <RotaryKnob
            value={settings.treble}
            label="TREBLE"
            onChange={(v) => onSettingsChange({ treble: v })}
            size="sm"
          />
          <RotaryKnob
            value={settings.presence}
            label="PRESENCE"
            onChange={(v) => onSettingsChange({ presence: v })}
            size="sm"
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

        <div className="flex items-center justify-center">
          <RotaryKnob
            value={settings.outputLevel}
            label="OUTPUT"
            onChange={(v) => onSettingsChange({ outputLevel: v })}
            size="md"
          />
        </div>
      </div>

      <div className="px-4 py-2 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-center gap-2">
        <span className="text-[9px] font-mono text-muted-foreground tracking-widest">7 • 8 • 9 STRING</span>
      </div>
    </div>
  );
}
