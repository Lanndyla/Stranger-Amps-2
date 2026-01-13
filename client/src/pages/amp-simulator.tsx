import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Settings, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { AmpHeadDisplay } from '@/components/amp/AmpHeadDisplay';
import { Cabinet } from '@/components/amp/Cabinet';
import { LeftControlPanel } from '@/components/amp/LeftControlPanel';
import { RightControlPanel } from '@/components/amp/RightControlPanel';
import { PresetSelector } from '@/components/amp/PresetSelector';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { defaultAmpSettings, builtInIRs, type AmpSettings, type Preset } from '@shared/schema';

export default function AmpSimulator() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AmpSettings>(defaultAmpSettings);
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const animationRef = useRef<number>();

  const { data: presets = [], isLoading: presetsLoading } = useQuery<Preset[]>({
    queryKey: ['/api/presets'],
  });

  const savePresetMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('POST', '/api/presets', {
        name,
        settings,
        isFactory: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presets'] });
      toast({
        title: 'Preset Saved',
        description: 'Your preset has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save preset.',
        variant: 'destructive',
      });
    },
  });

  const deletePresetMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/presets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presets'] });
      setCurrentPreset(null);
      toast({
        title: 'Preset Deleted',
        description: 'Preset has been removed.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete preset.',
        variant: 'destructive',
      });
    },
  });

  const handleSettingsChange = useCallback((newSettings: Partial<AmpSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    setCurrentPreset(null);
  }, []);

  const handlePresetChange = useCallback((preset: Preset) => {
    setCurrentPreset(preset);
    setSettings(preset.settings);
  }, []);

  useEffect(() => {
    const simulateInput = () => {
      const baseLevel = (settings.inputGain / 10) * 50;
      const driveBoost = (settings.drive / 10) * 20;
      const punishBoost = settings.punish ? 15 : 0;
      const dbBoost = settings.plus10db ? 10 : 0;
      
      const totalGain = baseLevel + driveBoost + punishBoost + dbBoost;
      const noise = Math.random() * 10 - 5;
      const level = Math.max(0, Math.min(100, totalGain + noise));
      
      setInputLevel(level);
      setIsClipping(level > 90);
      
      animationRef.current = requestAnimationFrame(simulateInput);
    };
    
    animationRef.current = requestAnimationFrame(simulateInput);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings.inputGain, settings.drive, settings.punish, settings.plus10db]);

  const currentIR = builtInIRs[settings.irIndex];

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      data-testid="amp-simulator-page"
    >
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">DS</span>
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              DJENT SLAYER
            </span>
          </div>
        </div>

        <PresetSelector
          presets={presets}
          currentPreset={currentPreset}
          onPresetChange={handlePresetChange}
          onSavePreset={(name) => savePresetMutation.mutate(name)}
          onDeletePreset={(id) => deletePresetMutation.mutate(id)}
          isLoading={presetsLoading}
        />

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                data-testid="button-mute"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isMuted ? 'Unmute' : 'Mute'}
            </TooltipContent>
          </Tooltip>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-settings">
                <Settings className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Audio
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 px-3 rounded bg-muted/50">
                      <span>Sample Rate</span>
                      <span className="font-mono text-muted-foreground">48000 Hz</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 rounded bg-muted/50">
                      <span>Buffer Size</span>
                      <span className="font-mono text-muted-foreground">256 samples</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 rounded bg-muted/50">
                      <span>Latency</span>
                      <span className="font-mono text-muted-foreground">5.3 ms</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    About
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>DJENT SLAYER is a high-gain amp simulator designed for low tunings and extended range guitars.</p>
                    <p>Optimized for 7, 8, and 9 string guitars in Drop A through Drop E tunings.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Overdrive Features
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">PUNISH</span>
                      <span>Tighter response with added saturation</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500 font-bold">+10dB</span>
                      <span>Gain boost on top of overdrive</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500 font-bold">+LOW</span>
                      <span>Low end boost in overdrive circuit</span>
                    </li>
                  </ul>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-help">
                <HelpCircle className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-2 text-sm">
                <p><strong>Controls:</strong></p>
                <p>Click and drag up/down on knobs to adjust</p>
                <p>Double-click to reset to default</p>
                <p>Scroll wheel for fine adjustment</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4 p-4 overflow-auto">
        <div className="order-2 lg:order-1">
          <LeftControlPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            inputLevel={inputLevel}
            isClipping={isClipping}
          />
        </div>

        <div className="order-1 lg:order-2 flex flex-col gap-4 items-center justify-center">
          <AmpHeadDisplay isClipping={isClipping} />
          <Cabinet 
            irName={settings.irBypass ? 'BYPASSED' : currentIR?.name} 
            isActive={!settings.irBypass}
          />
        </div>

        <div className="order-3">
          <RightControlPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </main>

      <footer className="px-4 py-2 border-t border-border bg-card/50 text-center">
        <span className="text-xs text-muted-foreground font-mono">
          Use your own IRs — flip IR BYPASS and load your favorite cabinet impulses
        </span>
      </footer>
    </div>
  );
}
