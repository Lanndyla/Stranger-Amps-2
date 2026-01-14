import { useState, useEffect } from 'react';
import { Mic, MicOff, RefreshCw, Wifi, WifiOff, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { audioEngine, type AudioDevice, type AudioMode } from '@/lib/audioEngine';
import { cn } from '@/lib/utils';

interface AudioDeviceSelectorProps {
  onConnectionChange?: (connected: boolean) => void;
}

export function AudioDeviceSelector({ onConnectionChange }: AudioDeviceSelectorProps) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioMode, setAudioMode] = useState<AudioMode>('worklet');
  const [nativeBridgeUrl, setNativeBridgeUrl] = useState('ws://localhost:9876');
  const [isNativeConnected, setIsNativeConnected] = useState(false);

  const loadDevices = async () => {
    const audioDevices = await audioEngine.getAudioDevices();
    const inputs = audioDevices.filter(d => d.kind === 'audioinput');
    setDevices(inputs);
    if (inputs.length > 0 && !selectedDevice) {
      setSelectedDevice(inputs[0].deviceId);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleModeChange = (mode: AudioMode) => {
    setAudioMode(mode);
    audioEngine.setAudioMode(mode);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (isConnected) {
        await audioEngine.disconnect();
        setIsConnected(false);
        onConnectionChange?.(false);
      } else {
        const success = await audioEngine.connect(selectedDevice || undefined);
        setIsConnected(success);
        onConnectionChange?.(success);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNativeBridgeConnect = () => {
    if (isNativeConnected) {
      audioEngine.disconnectFromNativeBridge();
    } else {
      audioEngine.connectToNativeBridge(nativeBridgeUrl, (connected) => {
        setIsNativeConnected(connected);
      });
    }
  };

  const inputDevices = devices.filter(d => d.kind === 'audioinput');

  return (
    <div 
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900/60"
      data-testid="audio-device-selector"
    >
      <div className={cn(
        "w-2 h-2 rounded-full transition-all",
        isConnected ? "bg-green-500 led-glow-green" : "bg-neutral-600"
      )} />
      
      <Select
        value={audioMode}
        onValueChange={(val) => handleModeChange(val as AudioMode)}
        disabled={isConnected}
      >
        <SelectTrigger 
          className="w-24 h-8 text-xs bg-neutral-800 border-neutral-700"
          data-testid="select-audio-mode"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="worklet" className="text-xs">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              <span>Worklet</span>
            </div>
          </SelectItem>
          <SelectItem value="webaudio" className="text-xs">
            <div className="flex items-center gap-1.5">
              <Mic className="w-3 h-3" />
              <span>Standard</span>
            </div>
          </SelectItem>
          <SelectItem value="native" className="text-xs">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <span>Native</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={selectedDevice}
        onValueChange={setSelectedDevice}
        disabled={isConnected}
      >
        <SelectTrigger 
          className="w-44 h-8 text-xs bg-neutral-800 border-neutral-700"
          data-testid="select-audio-device"
        >
          <SelectValue placeholder="Select input..." />
        </SelectTrigger>
        <SelectContent className="min-w-[280px]">
          {inputDevices.length === 0 ? (
            <SelectItem value="none" disabled>No devices found</SelectItem>
          ) : (
            inputDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId} className="text-xs">
                {device.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={loadDevices}
        disabled={isConnected}
        data-testid="button-refresh-devices"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </Button>

      <Button
        size="sm"
        variant={isConnected ? "destructive" : "default"}
        className="h-8 gap-1.5"
        onClick={handleConnect}
        disabled={isLoading || (!selectedDevice && !isConnected)}
        data-testid="button-connect-audio"
      >
        {isLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : isConnected ? (
          <MicOff className="w-3.5 h-3.5" />
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}
        <span className="text-xs font-semibold">
          {isConnected ? 'STOP' : 'START'}
        </span>
      </Button>

      {audioMode === 'native' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant={isNativeConnected ? "default" : "outline"}
              className="h-8 gap-1.5"
              data-testid="button-native-bridge"
            >
              {isNativeConnected ? (
                <Wifi className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-semibold">BRIDGE</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-neutral-900 border-neutral-700">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Native Bridge URL</Label>
                <Input
                  value={nativeBridgeUrl}
                  onChange={(e) => setNativeBridgeUrl(e.target.value)}
                  placeholder="ws://localhost:9876"
                  className="h-8 text-xs bg-neutral-800 border-neutral-700"
                  disabled={isNativeConnected}
                />
              </div>
              <Button
                size="sm"
                variant={isNativeConnected ? "destructive" : "default"}
                className="w-full h-8"
                onClick={handleNativeBridgeConnect}
              >
                {isNativeConnected ? 'Disconnect Bridge' : 'Connect Bridge'}
              </Button>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Connect to a native audio server (JUCE/VST host) for ultra-low latency processing. 
                The server must be running locally.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
