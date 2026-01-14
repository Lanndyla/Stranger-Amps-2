interface ToggleSwitchProps {
  isOn: boolean;
  label: string;
  onChange: (isOn: boolean) => void;
  variant?: 'default' | 'punish' | 'boost';
  size?: 'sm' | 'md';
}

export function ToggleSwitch({
  isOn,
  label,
  onChange,
  variant = 'default',
  size = 'md',
}: ToggleSwitchProps) {
  const ledColor = {
    default: isOn ? 'bg-green-500 led-glow-green' : 'bg-neutral-700',
    punish: isOn ? 'bg-red-500 led-glow-red' : 'bg-neutral-700',
    boost: isOn ? 'bg-amber-500 led-glow-amber' : 'bg-neutral-700',
  };

  const sizeClasses = {
    sm: {
      led: 'w-2 h-2',
      button: 'w-6 h-10',
      translate: 'translate-y-3',
      label: 'text-[10px]',
    },
    md: {
      led: 'w-3 h-3',
      button: 'w-8 h-14',
      translate: 'translate-y-4',
      label: 'text-xs',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div 
      className="flex flex-col items-center gap-1.5"
      data-testid={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`${sizes.led} rounded-full transition-all duration-200 ${ledColor[variant]}`} />
      
      <button
        onClick={() => onChange(!isOn)}
        className={`relative ${sizes.button} rounded-md bg-neutral-800 border border-neutral-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all`}
        role="switch"
        aria-checked={isOn}
        aria-label={label}
      >
        <div 
          className={`absolute inset-1 rounded transition-all duration-150 ${
            isOn 
              ? 'toggle-switch-on translate-y-0' 
              : `toggle-switch ${sizes.translate}`
          }`}
          style={{
            boxShadow: isOn 
              ? 'inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.4)'
              : 'inset 0 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
          }}
        >
          <div className="w-full h-1/2 flex items-center justify-center">
            <div className="w-4 h-0.5 rounded-full bg-neutral-800/30" />
          </div>
        </div>
      </button>
      
      <span className={`${sizes.label} font-semibold uppercase tracking-widest text-muted-foreground text-center max-w-16`}>
        {label}
      </span>
    </div>
  );
}
