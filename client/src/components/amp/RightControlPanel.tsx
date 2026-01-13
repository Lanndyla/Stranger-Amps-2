import { RotaryKnob } from './RotaryKnob';
import { ToggleSwitch } from './ToggleSwitch';
import { IRSelector } from './IRSelector';
import { RoutingSelector } from './RoutingSelector';
import type { AmpSettings } from '@shared/schema';

interface RightControlPanelProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
}

export function RightControlPanel({
  settings,
  onSettingsChange,
}: RightControlPanelProps) {
  return (
    <div 
      className="flex flex-col gap-6 p-6 amp-chassis metal-brushed rounded-lg border border-neutral-700 h-full"
      data-testid="right-control-panel"
    >
      <div className="text-center border-b border-neutral-700/50 pb-4">
        <span className="text-lg font-bold tracking-widest text-accent">OVERDRIVE</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <RotaryKnob
          value={settings.drive}
          label="DRIVE"
          onChange={(v) => onSettingsChange({ drive: v })}
          size="lg"
        />
        
        <div className="flex gap-4 justify-center">
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

      <div className="text-center border-b border-neutral-700/50 pb-4 pt-4 border-t">
        <span className="text-lg font-bold tracking-widest text-primary">OUTPUT</span>
      </div>

      <div className="flex justify-center">
        <RotaryKnob
          value={settings.masterVolume}
          label="MASTER"
          onChange={(v) => onSettingsChange({ masterVolume: v })}
          size="lg"
        />
      </div>

      <div className="text-center border-b border-neutral-700/50 pb-4 pt-4 border-t">
        <span className="text-lg font-bold tracking-widest text-primary">CABINET</span>
      </div>

      <div className="flex flex-col gap-4">
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

      <div className="mt-auto pt-4 border-t border-neutral-700/50 text-center">
        <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
          DROP A → DROP E
        </span>
      </div>
    </div>
  );
}
