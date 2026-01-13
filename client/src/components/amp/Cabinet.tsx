interface CabinetProps {
  irName?: string;
  isActive?: boolean;
}

export function Cabinet({ irName = 'DJENT CRUSH 4x12', isActive = true }: CabinetProps) {
  return (
    <div 
      className="relative w-full max-w-3xl mx-auto"
      data-testid="cabinet"
    >
      <div className="cabinet-body tolex-texture rounded-lg border border-neutral-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-neutral-700 border border-neutral-600" />
            <div className="w-4 h-4 rounded-full bg-neutral-700 border border-neutral-600" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold uppercase tracking-widest text-primary/80">
              DJENT SLAYER
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              4x12
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-neutral-700 border border-neutral-600" />
            <div className="w-4 h-4 rounded-full bg-neutral-700 border border-neutral-600" />
          </div>
        </div>

        <div className="relative p-4">
          <div className="cabinet-grill rounded-lg aspect-[4/3] relative overflow-hidden border border-neutral-800">
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8 p-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full relative"
                  style={{
                    background: `
                      radial-gradient(circle at 50% 50%, 
                        hsl(220 15% 12%) 0%,
                        hsl(220 15% 8%) 30%,
                        hsl(220 15% 6%) 60%,
                        hsl(220 15% 4%) 100%
                      )
                    `,
                    boxShadow: `
                      inset 0 0 20px rgba(0,0,0,0.8),
                      inset 0 0 40px rgba(0,0,0,0.4),
                      0 2px 4px rgba(0,0,0,0.5)
                    `,
                  }}
                >
                  <div 
                    className="absolute inset-4 rounded-full"
                    style={{
                      background: `
                        radial-gradient(circle at 50% 50%,
                          transparent 0%,
                          transparent 20%,
                          hsl(220 15% 10%) 21%,
                          hsl(220 15% 6%) 50%,
                          hsl(220 15% 4%) 100%
                        )
                      `,
                    }}
                  />
                  <div 
                    className="absolute inset-1/4 rounded-full bg-neutral-900"
                    style={{
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div className="absolute inset-1/4 rounded-full bg-neutral-800/50" />
                  </div>
                </div>
              ))}
            </div>

            <div 
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                isActive 
                  ? 'bg-neutral-900/80 border-neutral-700' 
                  : 'bg-amber-900/30 border-amber-700/50'
              }`}
              data-testid="cabinet-status"
            >
              <div className={`w-2 h-2 rounded-full ${
                isActive 
                  ? 'bg-green-500 led-glow-green' 
                  : 'bg-amber-500 led-glow-amber'
              }`} />
              <span className={`text-[10px] font-mono uppercase tracking-wide ${
                isActive ? 'text-green-400' : 'text-amber-400'
              }`}>
                {irName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-700 border border-neutral-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neutral-500" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-2 w-16 rounded-full bg-neutral-800" />
            <span className="text-xs text-muted-foreground font-mono">MADE FOR DJENT</span>
            <div className="h-2 w-16 rounded-full bg-neutral-800" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-700 border border-neutral-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neutral-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
