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
      <div className="amp-chassis metal-brushed rounded-t-lg border border-b-0 border-neutral-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-2 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-neutral-700 border border-neutral-600" />
              <div className="w-2 h-2 rounded-full bg-neutral-700 border border-neutral-600" />
            </div>
            <LEDIndicator isOn={true} color="green" label="PWR" />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              DJENT
            </span>
            <span className="text-2xl font-black tracking-tight text-foreground">
              SLAYER
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <LEDIndicator isOn={isClipping} color="red" label="CLIP" pulsing />
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-neutral-700 border border-neutral-600" />
              <div className="w-2 h-2 rounded-full bg-neutral-700 border border-neutral-600" />
            </div>
          </div>
        </div>

        <div className="amp-panel py-3">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-neutral-600 to-transparent" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                Low Tuning Specialist
              </span>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-neutral-600 to-transparent" />
            </div>
            
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-12 h-3 rounded-sm bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-center"
                >
                  <div className="w-8 h-px bg-neutral-600" />
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-neutral-600 to-transparent" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                Extended Range
              </span>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-neutral-600 to-transparent" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-1.5 bg-neutral-900/70 border-t border-neutral-800/50">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted-foreground">IN</span>
            <div className="w-2.5 h-2.5 rounded-full border border-neutral-500 bg-neutral-700" />
          </div>
          <div className="text-[9px] font-mono text-muted-foreground tracking-wider">
            MK II
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full border border-neutral-500 bg-neutral-700" />
            <span className="text-[9px] font-mono text-muted-foreground">OUT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
