import { useRef } from 'react';
import { builtInIRs } from '@shared/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleSwitch } from './ToggleSwitch';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface IRSelectorProps {
  selectedIR: number;
  irBypass: boolean;
  customIRName?: string;
  customIRLoaded?: boolean;
  onIRChange: (index: number) => void;
  onBypassChange: (bypass: boolean) => void;
  onLoadCustomIR?: (file: File) => void;
}

export function IRSelector({
  selectedIR,
  irBypass,
  customIRName,
  customIRLoaded,
  onIRChange,
  onBypassChange,
  onLoadCustomIR,
}: IRSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLoadCustomIR) {
      onLoadCustomIR(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-3" data-testid="ir-selector">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Cabinet IR
        </span>
      </div>
      
      <Select
        value={customIRLoaded ? 'custom' : selectedIR.toString()}
        onValueChange={(val) => {
          if (val !== 'custom') {
            onIRChange(parseInt(val, 10));
          }
        }}
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
          {customIRLoaded && customIRName && (
            <SelectItem 
              value="custom"
              className="font-mono text-xs text-blue-400"
            >
              {customIRName}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      <div className="flex items-center justify-center gap-2">
        <ToggleSwitch
          isOn={irBypass}
          label="BYPASS"
          onChange={onBypassChange}
          variant="boost"
          size="sm"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.WAV"
          onChange={handleFileChange}
          className="hidden"
          data-testid="ir-file-input"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleLoadClick}
          className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider bg-neutral-800 border-neutral-600 hover:bg-neutral-700"
          data-testid="button-load-ir"
        >
          <Upload className="w-3 h-3 mr-1" />
          Load IR
        </Button>
      </div>
    </div>
  );
}
