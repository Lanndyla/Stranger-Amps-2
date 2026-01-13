import { cn } from '@/lib/utils';

interface CabinetProps {
  irName?: string;
  isActive?: boolean;
}

export function Cabinet({ irName = 'Default IR', isActive = true }: CabinetProps) {
  return (
    <div 
      className="relative w-full"
      data-testid="cabinet"
    >
      <div className="cabinet-body tolex-texture rounded-b-lg border border-t-0 border-neutral-700 overflow-hidden">
        <div className="p-3">
          <div 
            className="cabinet-grill rounded-lg border border-neutral-800/50 overflow-hidden" 
            style={{ aspectRatio: '16/9' }}
          >
            <div className="grid grid-cols-2 gap-2 h-full p-3">
              {[1, 2, 3, 4].map((speaker) => (
                <div
                  key={speaker}
                  className="relative rounded-full flex items-center justify-center overflow-hidden"
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
                    aspectRatio: '1/1',
                  }}
                >
                  <div 
                    className="absolute inset-[10%] rounded-full"
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
                    className="absolute inset-[30%] rounded-full bg-neutral-900"
                    style={{
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div className="absolute inset-[30%] rounded-full bg-neutral-800/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 px-4 py-2 bg-neutral-900/60 border-t border-neutral-800/50">
          <div className={cn(
            "w-2 h-2 rounded-full transition-all",
            isActive 
              ? "bg-green-500 led-glow-green" 
              : "bg-amber-500 led-glow-amber"
          )} />
          <span className={cn(
            "text-[10px] font-mono tracking-widest uppercase",
            isActive ? "text-green-400" : "text-amber-400"
          )}>
            {irName}
          </span>
          <span className="text-[9px] font-bold text-muted-foreground">4x12</span>
        </div>
      </div>
    </div>
  );
}
