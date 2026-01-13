interface LEDIndicatorProps {
  isOn: boolean;
  color?: 'green' | 'red' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  pulsing?: boolean;
}

export function LEDIndicator({
  isOn,
  color = 'green',
  size = 'md',
  label,
  pulsing = false,
}: LEDIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    green: isOn ? 'bg-green-500 led-glow-green' : 'bg-neutral-700',
    red: isOn ? 'bg-red-500 led-glow-red' : 'bg-neutral-700',
    amber: isOn ? 'bg-amber-500 led-glow-amber' : 'bg-neutral-700',
  };

  return (
    <div className="flex flex-col items-center gap-1" data-testid={`led-${label?.toLowerCase().replace(/\s+/g, '-') || 'indicator'}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          transition-all duration-200
          ${colorClasses[color]}
          ${pulsing && isOn ? 'animate-pulse' : ''}
        `}
        role="status"
        aria-label={label ? `${label}: ${isOn ? 'on' : 'off'}` : undefined}
      />
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
