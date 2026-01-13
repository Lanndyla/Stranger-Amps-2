import { LEDIndicator } from './LEDIndicator';

interface AmpHeadDisplayProps {
  isClipping?: boolean;
}

export function AmpHeadDisplay({ isClipping = false }: AmpHeadDisplayProps) {
  return (
    <div 
      className="relative w-full"
      data-testid="amp-head-display"
    >
      <div className="amp-chassis metal-brushed rounded-lg border border-neutral-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-600" />
              <div className="w-3 h-3 rounded-full bg-neutral-600" />
            </div>
            <LEDIndicator isOn={true} color="green" label="PWR" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold tracking-tight text-primary">
              DJENT
            </span>
            <span className="text-3xl font-bold tracking-tight text-foreground">
              SLAYER
            </span>
            <span className="text-sm font-mono text-muted-foreground ml-3">
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

        <div className="amp-panel py-4 px-6">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-0.5 bg-neutral-700 rounded-full" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Low Tuning Specialist
              </span>
              <div className="h-12 w-0.5 bg-neutral-700 rounded-full" />
            </div>
            
            <div className="flex gap-2">
              <div className="w-16 h-4 rounded bg-neutral-800/50 border border-neutral-700 flex items-center justify-center">
                <div className="w-12 h-0.5 bg-neutral-600 rounded-full" />
              </div>
              <div className="w-16 h-4 rounded bg-neutral-800/50 border border-neutral-700 flex items-center justify-center">
                <div className="w-12 h-0.5 bg-neutral-600 rounded-full" />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-0.5 bg-neutral-700 rounded-full" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Extended Range
              </span>
              <div className="h-12 w-0.5 bg-neutral-700 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-2 border-t border-neutral-700/50 bg-neutral-900/50">
          <div className="text-[10px] font-mono text-muted-foreground">
            INPUT
          </div>
          <div className="flex gap-4">
            <div className="w-3 h-3 rounded-full border border-neutral-600 bg-neutral-700" />
            <div className="w-3 h-3 rounded-full border border-neutral-600 bg-neutral-700" />
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
