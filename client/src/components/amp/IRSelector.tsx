import { builtInIRs } from '@shared/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleSwitch } from './ToggleSwitch';

interface IRSelectorProps {
  selectedIR: number;
  irBypass: boolean;
  onIRChange: (index: number) => void;
  onBypassChange: (bypass: boolean) => void;
}

export function IRSelector({
  selectedIR,
  irBypass,
  onIRChange,
  onBypassChange,
}: IRSelectorProps) {
  return (
    <div className="flex flex-col gap-3" data-testid="ir-selector">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Cabinet IR
        </span>
      </div>
      
      <Select
        value={selectedIR.toString()}
        onValueChange={(val) => onIRChange(parseInt(val, 10))}
        disabled={irBypass}
      >
        <SelectTrigger 
          className={`w-full bg-neutral-900 border-neutral-700 font-mono text-xs ${irBypass ? 'opacity-50' : ''}`}
          data-testid="ir-select-trigger"
        >
          <SelectValue placeholder="Select IR" />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border-neutral-700 min-w-[240px]">
          {builtInIRs.map((ir) => (
            <SelectItem 
              key={ir.id} 
              value={ir.id.toString()}
              className="font-mono text-xs"
            >
              {ir.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex justify-center">
        
        <ToggleSwitch
          isOn={irBypass}
          label="BYPASS"
          onChange={onBypassChange}
          variant="boost"
        />
      </div>
    </div>
  );
}
