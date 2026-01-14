import { RotaryKnob } from './RotaryKnob';
import { ToggleSwitch } from './ToggleSwitch';
import { LEDIndicator } from './LEDIndicator';
import { GainMeter } from './GainMeter';
import { IRSelector } from './IRSelector';
import { RoutingSelector } from './RoutingSelector';
import type { AmpSettings } from '@shared/schema';

interface AmpHeadProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
  inputLevel?: number;
  isClipping?: boolean;
}

export function AmpHead({ 
  settings, 
  onSettingsChange,
  inputLevel = 0,
  isClipping = false,
}: AmpHeadProps) {
  return (
    <div 
      className="relative w-full max-w-3xl mx-auto"
      data-testid="amp-head"
    >
      <div className="amp-chassis metal-brushed rounded-lg border border-neutral-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-2 border-b border-neutral-700/50 bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-600" />
              <div className="w-3 h-3 rounded-full bg-neutral-600" />
            </div>
            <LEDIndicator isOn={true} color="green" label="PWR" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              STRANGER
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              AMPS
            </span>
            <span className="text-xs font-mono text-muted-foreground ml-2">
              II II II II
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <LEDIndicator isOn={isClipping} color="red" label="CLIP" pulsing />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-600" />
              <div className="w-3 h-3 rounded-full bg-neutral-600" />
            </div>
          </div>
        </div>

        <div className="amp-panel p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-primary text-center">
                Input
              </span>
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

            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-primary text-center">
                EQ
              </span>
              <div className="flex items-end gap-3">
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
                  label="PRES"
                  onChange={(v) => onSettingsChange({ presence: v })}
                  size="md"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent text-center">
                Overdrive
              </span>
              <div className="flex items-end gap-4">
                <RotaryKnob
                  value={settings.drive}
                  label="DRIVE"
                  onChange={(v) => onSettingsChange({ drive: v })}
                  size="lg"
                />
                <div className="flex gap-3">
                  <ToggleSwitch
                    isOn={settings.punish}
                    label="PUNISH"
                    onChange={(v) => onSettingsChange({ punish: v })}
                    variant="punish"
                  />
                  <ToggleSwitch
                    isOn={settings.plus10db}
                    label="+10dB"
                    onChange={(v) => onSettingsChange({ plus10db: v })}
                    variant="boost"
                  />
                  <ToggleSwitch
                    isOn={settings.plusLow}
                    label="+LOW"
                    onChange={(v) => onSettingsChange({ plusLow: v })}
                    variant="boost"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-primary text-center">
                Output
              </span>
              <RotaryKnob
                value={settings.masterVolume}
                label="MASTER"
                onChange={(v) => onSettingsChange({ masterVolume: v })}
                size="lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800/50">
            <IRSelector
              selectedIR={settings.irIndex}
              irBypass={settings.irBypass}
              onIRChange={(v) => onSettingsChange({ irIndex: v })}
              onBypassChange={(v) => onSettingsChange({ irBypass: v })}
            />
            
            <RoutingSelector
              routingMode={settings.routingMode}
              onChange={(v) => onSettingsChange({ routingMode: v })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-2 border-t border-neutral-700/50 bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
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
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
            LOW TUNING SPECIALIST • DROP A → DROP E
          </span>
          <div className="text-[10px] font-mono text-muted-foreground">
            v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
