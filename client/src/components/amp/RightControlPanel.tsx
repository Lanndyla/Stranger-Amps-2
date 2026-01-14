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
      className="flex flex-col h-full amp-panel rounded-lg border border-neutral-800 overflow-hidden"
      data-testid="right-control-panel"
    >
      <div className="px-4 py-3 bg-neutral-900/80 border-b border-neutral-800">
        <span className="text-sm font-bold tracking-[0.3em] text-accent uppercase">OVERDRIVE</span>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-5">
        <div className="flex items-center justify-center gap-6">
          <RotaryKnob
            value={settings.drive}
            label="DRIVE"
            onChange={(v) => onSettingsChange({ drive: v })}
            size="lg"
          />
          <RotaryKnob
            value={settings.masterVolume}
            label="MASTER"
            onChange={(v) => onSettingsChange({ masterVolume: v })}
            size="lg"
          />
        </div>

        <div className="flex items-center justify-center gap-3">
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

        <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

        <div className="space-y-4">
          <IRSelector
            selectedIR={settings.irIndex}
            irBypass={settings.irBypass}
            onIRChange={(v) => onSettingsChange({ irIndex: v })}
            onBypassChange={(v) => onSettingsChange({ irBypass: v })}
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

        <div className="space-y-4">
          <div className="text-center">
            <span className="text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase">Routing</span>
          </div>
          <RoutingSelector
            routingMode={settings.routingMode}
            onChange={(v) => onSettingsChange({ routingMode: v })}
          />
        </div>
      </div>

      <div className="px-4 py-2 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-center">
        <span className="text-[9px] font-mono text-muted-foreground tracking-widest">DROP A → DROP E</span>
      </div>
    </div>
  );
}
