import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Settings, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { AmpHeadDisplay } from '@/components/amp/AmpHeadDisplay';
import { Cabinet } from '@/components/amp/Cabinet';
import { LeftControlPanel } from '@/components/amp/LeftControlPanel';
import { RightControlPanel } from '@/components/amp/RightControlPanel';
import { PresetSelector } from '@/components/amp/PresetSelector';
import { AudioDeviceSelector } from '@/components/amp/AudioDeviceSelector';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { audioEngine } from '@/lib/audioEngine';
import { defaultAmpSettings, builtInIRs, type AmpSettings, type Preset } from '@shared/schema';

export default function AmpSimulator() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AmpSettings>(defaultAmpSettings);
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioConnected, setIsAudioConnected] = useState(false);
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
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      audioEngine.updateSettings(updated);
      return updated;
    });
    setCurrentPreset(null);
  }, []);

  const handlePresetChange = useCallback((preset: Preset) => {
    setCurrentPreset(preset);
    setSettings(preset.settings);
    audioEngine.updateSettings(preset.settings);
  }, []);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioEngine.setMuted(newMuted);
  }, [isMuted]);

  const handleAudioConnectionChange = useCallback((connected: boolean) => {
    setIsAudioConnected(connected);
    if (connected) {
      audioEngine.updateSettings(settings);
      audioEngine.setMuted(isMuted);
      toast({
        title: 'Audio Connected',
        description: 'Your audio interface is now active. Start playing!',
      });
    } else {
      toast({
        title: 'Audio Disconnected',
        description: 'Audio interface has been disconnected.',
      });
    }
  }, [settings, isMuted, toast]);

  useEffect(() => {
    const updateLevel = () => {
      if (isAudioConnected) {
        const level = audioEngine.getInputLevel();
        setInputLevel(level);
        setIsClipping(level > 85);
      } else {
        const baseLevel = (settings.inputGain / 10) * 50;
        const driveBoost = (settings.drive / 10) * 20;
        const punishBoost = settings.punish ? 15 : 0;
        const dbBoost = settings.plus10db ? 10 : 0;
        
        const totalGain = baseLevel + driveBoost + punishBoost + dbBoost;
        const noise = Math.random() * 10 - 5;
        const level = Math.max(0, Math.min(100, totalGain + noise));
        
        setInputLevel(level);
        setIsClipping(level > 90);
      }
      
      animationRef.current = requestAnimationFrame(updateLevel);
    };
    
    animationRef.current = requestAnimationFrame(updateLevel);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings.inputGain, settings.drive, settings.punish, settings.plus10db, isAudioConnected]);

  useEffect(() => {
    return () => {
      audioEngine.disconnect();
    };
  }, []);

  const currentIR = builtInIRs[settings.irIndex];

  return (
    <div 
      className="h-screen bg-background flex flex-col overflow-hidden"
      data-testid="amp-simulator-page"
    >
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 backdrop-blur-sm z-50 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">DS</span>
            </div>
            <span className="text-lg font-bold tracking-tight hidden md:block">
              DJENT SLAYER
            </span>
          </div>
          
          <AudioDeviceSelector onConnectionChange={handleAudioConnectionChange} />
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
                variant={isMuted ? "destructive" : "ghost"}
                onClick={handleMuteToggle}
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
                <SheetDescription>Configure your amp simulator settings.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Audio
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 px-3 rounded bg-muted/50">
                      <span>Status</span>
                      <span className={`font-mono ${isAudioConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {isAudioConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
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
                      <span className="font-mono text-muted-foreground">~5.3 ms</span>
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
                <p><strong>Getting Started:</strong></p>
                <p>1. Select your audio interface from the dropdown</p>
                <p>2. Click CONNECT to enable audio</p>
                <p>3. Dial in your tone with the controls</p>
                <p><strong>Controls:</strong></p>
                <p>Click and drag up/down on knobs to adjust</p>
                <p>Double-click to reset to default</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      <main className="flex-1 flex items-stretch justify-center gap-4 p-4 min-h-0">
        <div className="w-64 flex-shrink-0">
          <LeftControlPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            inputLevel={inputLevel}
            isClipping={isClipping}
          />
        </div>

        <div className="flex flex-col flex-1 max-w-2xl min-w-0">
          <AmpHeadDisplay isClipping={isClipping} />
          <Cabinet 
            irName={settings.irBypass ? 'BYPASSED' : currentIR?.name} 
            isActive={!settings.irBypass}
          />
        </div>

        <div className="w-72 flex-shrink-0">
          <RightControlPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </main>

      <footer className="flex-shrink-0 px-4 py-2 border-t border-border bg-card/50 text-center">
        <span className="text-xs text-muted-foreground font-mono">
          {isAudioConnected 
            ? 'Audio connected — play your guitar through the amp!' 
            : 'Connect your audio interface to start playing'}
        </span>
      </footer>
    </div>
  );
}
