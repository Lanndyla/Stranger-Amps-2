import { cn } from '@/lib/utils';

interface CabinetProps {
  irName?: string;
  isActive?: boolean;
  irIndex?: number;
}

const cabinetColors: Record<number, { 
  tolex: string; 
  grillDark: string;
  grillLight: string;
  speakerOuter: string;
  speakerInner: string;
  accent: string;
}> = {
  [-1]: { tolex: '#0a1a1a', grillDark: '#081414', grillLight: '#0c1c1c', speakerOuter: '#061010', speakerInner: '#040c0c', accent: '#22d3ee' },
  0: { tolex: '#1a1a1a', grillDark: '#0d0d12', grillLight: '#1a1a22', speakerOuter: '#0a0a0e', speakerInner: '#080810', accent: '#3b82f6' },
  1: { tolex: '#1c1c1c', grillDark: '#1a1610', grillLight: '#262015', speakerOuter: '#141210', speakerInner: '#0e0c0a', accent: '#f5f5dc' },
  2: { tolex: '#0a0a0a', grillDark: '#101010', grillLight: '#1a1a1a', speakerOuter: '#0c0c0c', speakerInner: '#080808', accent: '#ef4444' },
  3: { tolex: '#c2410c', grillDark: '#2a1508', grillLight: '#3d2010', speakerOuter: '#1a0d05', speakerInner: '#120a04', accent: '#fb923c' },
  4: { tolex: '#1a0a0a', grillDark: '#1a0808', grillLight: '#2a1010', speakerOuter: '#120606', speakerInner: '#0a0404', accent: '#dc2626' },
  5: { tolex: '#1a1a1a', grillDark: '#141414', grillLight: '#202020', speakerOuter: '#0e0e0e', speakerInner: '#0a0a0a', accent: '#a1a1aa' },
  6: { tolex: '#0f0f0f', grillDark: '#0a0a0a', grillLight: '#151515', speakerOuter: '#080808', speakerInner: '#050505', accent: '#fbbf24' },
  7: { tolex: '#0a0a0a', grillDark: '#0c0c0c', grillLight: '#161616', speakerOuter: '#090909', speakerInner: '#060606', accent: '#9ca3af' },
  8: { tolex: '#2d1f0a', grillDark: '#1a1208', grillLight: '#261a0c', speakerOuter: '#120c06', speakerInner: '#0a0804', accent: '#d4a574' },
  9: { tolex: '#1a0a1a', grillDark: '#140a14', grillLight: '#1e101e', speakerOuter: '#0e060e', speakerInner: '#080408', accent: '#a855f7' },
};

export function Cabinet({ irName = 'Default IR', isActive = true, irIndex = 0 }: CabinetProps) {
  const colors = cabinetColors[irIndex] || cabinetColors[0];
  
  return (
    <div 
      className="relative w-full flex-1"
      data-testid="cabinet"
    >
      <div 
        className="cabinet-body rounded-b-lg border border-t-0 border-neutral-700 overflow-hidden h-full flex flex-col transition-all duration-500"
        style={{ 
          backgroundColor: colors.tolex,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.02) 2px,
              rgba(255,255,255,0.02) 4px
            )
          `
        }}
      >
        <div className="flex-1 p-3 min-h-0">
          <div 
            className="rounded-lg border border-neutral-800/50 overflow-hidden h-full relative transition-all duration-500"
            style={{ backgroundColor: colors.grillDark }}
          >
            <div 
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.4) 2px,
                    rgba(0,0,0,0.4) 4px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.2) 2px,
                    rgba(0,0,0,0.2) 4px
                  )
                `,
              }}
            />
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full p-3 place-items-center relative z-0">
              {[1, 2, 3, 4].map((speaker) => (
                <div
                  key={speaker}
                  className="relative rounded-full flex items-center justify-center overflow-hidden aspect-square w-full max-w-[200px] transition-all duration-500"
                  style={{
                    background: `
                      radial-gradient(circle at 50% 50%, 
                        ${colors.speakerOuter} 0%,
                        ${colors.speakerOuter} 30%,
                        ${colors.speakerInner} 60%,
                        ${colors.speakerInner} 100%
                      )
                    `,
                    boxShadow: `
                      inset 0 0 15px rgba(0,0,0,0.8),
                      inset 0 0 30px rgba(0,0,0,0.4),
                      0 2px 4px rgba(0,0,0,0.5)
                    `,
                  }}
                >
                  <div 
                    className="absolute inset-[10%] rounded-full transition-all duration-500"
                    style={{
                      background: `
                        radial-gradient(circle at 50% 50%,
                          transparent 0%,
                          transparent 20%,
                          ${colors.speakerOuter} 21%,
                          ${colors.speakerInner} 50%,
                          ${colors.speakerInner} 100%
                        )
                      `,
                    }}
                  />
                  <div 
                    className="absolute inset-[30%] rounded-full bg-neutral-900 transition-all duration-500"
                    style={{
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div 
                      className="absolute inset-[30%] rounded-full transition-all duration-500"
                      style={{ backgroundColor: `${colors.accent}15` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div 
          className="flex-shrink-0 flex items-center justify-center gap-4 px-4 py-2 border-t border-neutral-800/50 transition-all duration-500"
          style={{ backgroundColor: `${colors.tolex}ee` }}
        >
          <div 
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              isActive ? "led-glow-green" : "led-glow-amber"
            )}
            style={{ backgroundColor: isActive ? colors.accent : '#f59e0b' }}
          />
          <span 
            className="text-[10px] font-mono tracking-widest uppercase transition-all duration-500"
            style={{ color: colors.accent }}
          >
            {irName}
          </span>
          <span className="text-[9px] font-bold text-muted-foreground">4x12</span>
        </div>
      </div>
    </div>
  );
}
