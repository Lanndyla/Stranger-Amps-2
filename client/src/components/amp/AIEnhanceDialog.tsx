import { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ToggleSwitch } from './ToggleSwitch';
import type { AmpSettings } from '@shared/schema';

interface AIEnhanceDialogProps {
  settings: AmpSettings;
  onSettingsChange: (settings: Partial<AmpSettings>) => void;
  onOptimize: () => void;
  isOptimizing?: boolean;
}

const tuningOptions = [
  { value: 'dropA', label: 'Drop A', description: '7-string standard' },
  { value: 'dropB', label: 'Drop B', description: '7-string / 8-string' },
  { value: 'dropC', label: 'Drop C', description: '6-string djent' },
  { value: 'dropD', label: 'Drop D', description: 'Classic metal' },
  { value: 'dropE', label: 'Drop E', description: '8/9-string extreme' },
] as const;

export function AIEnhanceDialog({ 
  settings, 
  onSettingsChange, 
  onOptimize,
  isOptimizing = false,
}: AIEnhanceDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={settings.aiEnhance ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5 font-mono text-xs"
          data-testid="button-ai-enhance"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI TONE</span>
          {settings.aiEnhance && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" style={{ boxShadow: '0 0 8px 2px rgba(168, 85, 247, 0.6)' }} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wider text-purple-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI TONE ENHANCEMENT
          </DialogTitle>
          <DialogDescription className="sr-only">
            AI-powered tone optimization for low-tuned guitars
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <p className="text-sm text-purple-200">
              AI-powered tone optimization analyzes your settings and enhances them for your specific tuning, 
              improving clarity and tightness for low-frequency content.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Enable AI Enhancement
            </span>
            <ToggleSwitch
              isOn={settings.aiEnhance}
              label=""
              onChange={(v) => onSettingsChange({ aiEnhance: v })}
              variant="default"
              size="sm"
            />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Target Tuning
            </span>
            <Select
              value={settings.aiTuning}
              onValueChange={(val) => onSettingsChange({ aiTuning: val as AmpSettings['aiTuning'] })}
            >
              <SelectTrigger 
                className="w-full bg-neutral-800 border-neutral-700 font-mono"
                data-testid="select-ai-tuning"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                {tuningOptions.map((tuning) => (
                  <SelectItem key={tuning.value} value={tuning.value} className="font-mono">
                    <div className="flex flex-col">
                      <span className="font-semibold">{tuning.label}</span>
                      <span className="text-xs text-muted-foreground">{tuning.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
            data-testid="button-optimize-tone"
          >
            {isOptimizing ? (
              <>
                <Zap className="w-4 h-4 animate-pulse" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Optimize Tone for {tuningOptions.find(t => t.value === settings.aiTuning)?.label}
              </>
            )}
          </Button>

          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <p className="text-[10px] text-muted-foreground text-center">
              AI analyzes frequency response and adjusts EQ, gain staging, and presence 
              for maximum clarity in low tunings
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
