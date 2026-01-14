import { useState, useEffect } from 'react';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { audioEngine, type AudioDevice } from '@/lib/audioEngine';
import { cn } from '@/lib/utils';

interface AudioDeviceSelectorProps {
  onConnectionChange?: (connected: boolean) => void;
}

export function AudioDeviceSelector({ onConnectionChange }: AudioDeviceSelectorProps) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        value={selectedDevice}
        onValueChange={setSelectedDevice}
        disabled={isConnected}
      >
        <SelectTrigger 
          className="w-40 h-8 text-xs bg-neutral-800 border-neutral-700"
          data-testid="select-audio-device"
        >
          <SelectValue placeholder="Select input..." />
        </SelectTrigger>
        <SelectContent>
          {inputDevices.length === 0 ? (
            <SelectItem value="none" disabled>No devices found</SelectItem>
          ) : (
            inputDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label.length > 25 ? device.label.slice(0, 25) + '...' : device.label}
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
          {isConnected ? 'DISCONNECT' : 'CONNECT'}
        </span>
      </Button>
    </div>
  );
}
