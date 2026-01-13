import { useState } from 'react';
import { ChevronDown, Save, FolderOpen, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Preset } from '@shared/schema';

interface PresetSelectorProps {
  presets: Preset[];
  currentPreset: Preset | null;
  onPresetChange: (preset: Preset) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  isLoading?: boolean;
}

export function PresetSelector({
  presets,
  currentPreset,
  onPresetChange,
  onSavePreset,
  onDeletePreset,
  isLoading = false,
}: PresetSelectorProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleSave = () => {
    if (newPresetName.trim()) {
      onSavePreset(newPresetName.trim());
      setNewPresetName('');
      setSaveDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2" data-testid="preset-selector">
      <Select
        value={currentPreset?.id || ''}
        onValueChange={(id) => {
          const preset = presets.find((p) => p.id === id);
          if (preset) onPresetChange(preset);
        }}
        disabled={isLoading}
      >
        <SelectTrigger 
          className="w-48 bg-neutral-900 border-neutral-700 font-semibold uppercase tracking-wide"
          data-testid="preset-select-trigger"
        >
          <SelectValue placeholder="Select Preset">
            {currentPreset?.name || 'INIT'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border-neutral-700">
          {presets.map((preset) => (
            <SelectItem 
              key={preset.id} 
              value={preset.id}
              className="font-semibold uppercase tracking-wide"
            >
              <div className="flex items-center justify-between w-full gap-4">
                <span>{preset.name}</span>
                {preset.isFactory && (
                  <span className="text-[10px] text-muted-foreground">FACTORY</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" data-testid="button-save-preset">
            <Save className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <Input
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Enter preset name..."
              className="bg-neutral-900 border-neutral-700"
              data-testid="input-preset-name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setSaveDialogOpen(false)}
                data-testid="button-cancel-save"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!newPresetName.trim()}
                data-testid="button-confirm-save"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {currentPreset && !currentPreset.isFactory && (
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => onDeletePreset(currentPreset.id)}
          data-testid="button-delete-preset"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
