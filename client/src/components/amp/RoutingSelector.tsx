import type { AmpSettings } from '@shared/schema';

interface RoutingSelectorProps {
  routingMode: AmpSettings['routingMode'];
  onChange: (mode: AmpSettings['routingMode']) => void;
}

export function RoutingSelector({ routingMode, onChange }: RoutingSelectorProps) {
  const modes: { value: AmpSettings['routingMode']; label: string; description: string }[] = [
    { value: 'direct', label: 'DIRECT', description: 'Direct to PA/Interface' },
    { value: 'fxloop', label: 'FX LOOP', description: 'Into amp FX return' },
    { value: 'live', label: 'LIVE', description: 'Clean power amp + cab' },
  ];

  return (
    <div className="flex flex-col gap-2" data-testid="routing-selector">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">
        Routing
      </span>
      <div className="flex gap-1 p-1 rounded-md bg-neutral-900/50 border border-neutral-800">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`
              px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide transition-all
              ${routingMode === mode.value 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-neutral-800'
              }
            `}
            title={mode.description}
            data-testid={`button-routing-${mode.value}`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
