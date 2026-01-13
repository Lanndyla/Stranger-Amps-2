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
      className="flex flex-col gap-6 p-6 amp-chassis metal-brushed rounded-lg border border-neutral-700 h-full"
      data-testid="left-control-panel"
    >
      <div className="text-center border-b border-neutral-700/50 pb-4">
        <span className="text-lg font-bold tracking-widest text-primary">INPUT</span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-end gap-4">
          <RotaryKnob
            value={settings.inputGain}
            label="GAIN"
            onChange={(v) => onSettingsChange({ inputGain: v })}
            size="lg"
          />
          <GainMeter level={inputLevel} isClipping={isClipping} />
        </div>
      </div>

      <div className="text-center border-b border-neutral-700/50 pb-4 pt-4 border-t">
        <span className="text-lg font-bold tracking-widest text-primary">EQ</span>
      </div>

      <div className="grid grid-cols-2 gap-4 place-items-center">
        <RotaryKnob
          value={settings.bass}
          label="BASS"
          onChange={(v) => onSettingsChange({ bass: v })}
          size="md"
        />
        <RotaryKnob
          value={settings.mid}
          label="MID"
          onChange={(v) => onSettingsChange({ mid: v })}
          size="md"
        />
        <RotaryKnob
          value={settings.treble}
          label="TREBLE"
          onChange={(v) => onSettingsChange({ treble: v })}
          size="md"
        />
        <RotaryKnob
          value={settings.presence}
          label="PRESENCE"
          onChange={(v) => onSettingsChange({ presence: v })}
          size="md"
        />
      </div>

      <div className="mt-auto pt-4 border-t border-neutral-700/50">
        <div className="flex justify-center gap-1">
          {['7', '8', '9'].map((s) => (
            <span 
              key={s} 
              className="px-2 py-0.5 text-[10px] font-bold rounded bg-neutral-800 text-primary border border-neutral-700"
            >
              {s}STR
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
