import { useState, useEffect, useRef, useCallback } from 'react';
import { Gauge } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TunerDialogProps {
  isAudioConnected: boolean;
}

const NOTE_STRINGS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const DROP_TUNINGS = {
  standard: { name: 'Standard', notes: ['E', 'A', 'D', 'G', 'B', 'E'] },
  dropD: { name: 'Drop D', notes: ['D', 'A', 'D', 'G', 'B', 'E'] },
  dropC: { name: 'Drop C', notes: ['C', 'G', 'C', 'F', 'A', 'D'] },
  dropB: { name: 'Drop B', notes: ['B', 'F#', 'B', 'E', 'G#', 'C#'] },
  dropA: { name: 'Drop A', notes: ['A', 'E', 'A', 'D', 'F#', 'B'] },
  dropA7: { name: 'Drop A (7)', notes: ['A', 'E', 'A', 'D', 'G', 'B', 'E'] },
  dropE8: { name: 'Drop E (8)', notes: ['E', 'B', 'E', 'A', 'D', 'G', 'B', 'E'] },
};

export function TunerDialog({ isAudioConnected }: TunerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [currentFreq, setCurrentFreq] = useState<number>(0);
  const [cents, setCents] = useState<number>(0);
  const [selectedTuning, setSelectedTuning] = useState<keyof typeof DROP_TUNINGS>('dropA7');
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getNoteFromFrequency = useCallback((frequency: number) => {
    const noteNum = 12 * (Math.log2(frequency / 440));
    const roundedNote = Math.round(noteNum);
    const centsOff = Math.round((noteNum - roundedNote) * 100);
    const noteIndex = ((roundedNote % 12) + 12) % 12;
    const octave = Math.floor((roundedNote + 9) / 12) + 4;
    
    return {
      note: NOTE_STRINGS[noteIndex],
      octave,
      cents: centsOff,
    };
  }, []);

  const autoCorrelate = useCallback((buffer: Float32Array, sampleRate: number) => {
    let SIZE = buffer.length;
    let rms = 0;
    
    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    
    if (rms < 0.01) return -1;
    
    let r1 = 0, r2 = SIZE - 1;
    const thres = 0.2;
    
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }
    
    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;
    
    const c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] += buffer[j] * buffer[j + i];
      }
    }
    
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    
    let T0 = maxpos;
    
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    
    return sampleRate / T0;
  }, []);

  const updatePitch = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;
    
    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);
    
    const freq = autoCorrelate(buffer, audioContextRef.current.sampleRate);
    
    if (freq > 0 && freq < 2000) {
      setCurrentFreq(Math.round(freq * 10) / 10);
      const { note, octave, cents } = getNoteFromFrequency(freq);
      setCurrentNote(`${note}${octave}`);
      setCents(cents);
    } else {
      setCurrentNote(null);
      setCents(0);
    }
    
    animationFrameRef.current = requestAnimationFrame(updatePitch);
  }, [autoCorrelate, getNoteFromFrequency]);

  const startTuner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096;
      
      source.connect(analyserRef.current);
      updatePitch();
    } catch (err) {
      console.error('Failed to start tuner:', err);
    }
  }, [updatePitch]);

  const stopTuner = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setCurrentNote(null);
    setCents(0);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startTuner();
    } else {
      stopTuner();
    }
    
    return () => {
      stopTuner();
    };
  }, [isOpen, startTuner, stopTuner]);

  const getCentsColor = () => {
    const absCents = Math.abs(cents);
    if (absCents <= 5) return 'text-green-400';
    if (absCents <= 15) return 'text-yellow-400';
    return 'text-red-400';
  };

  const tuning = DROP_TUNINGS[selectedTuning];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 font-mono text-xs"
          data-testid="button-tuner"
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>TUNER</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wider text-emerald-400 flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            CHROMATIC TUNER
          </DialogTitle>
          <DialogDescription className="sr-only">
            Chromatic tuner optimized for low tunings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {(Object.keys(DROP_TUNINGS) as Array<keyof typeof DROP_TUNINGS>).map((key) => (
              <Button
                key={key}
                variant={selectedTuning === key ? "default" : "outline"}
                size="sm"
                className="text-xs font-mono"
                onClick={() => setSelectedTuning(key)}
                data-testid={`button-tuning-${key}`}
              >
                {DROP_TUNINGS[key].name}
              </Button>
            ))}
          </div>

          <div className="text-center py-6">
            <div className={`text-6xl font-bold font-mono ${getCentsColor()}`}>
              {currentNote || '--'}
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-mono">
              {currentFreq > 0 ? `${currentFreq} Hz` : '---'}
            </div>
          </div>

          <div className="relative h-8 bg-neutral-800 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-full bg-green-500/50" />
            </div>
            <div 
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-75 ${getCentsColor().replace('text-', 'bg-')}`}
              style={{ 
                left: `${50 + (cents / 50) * 50}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[8px] text-muted-foreground font-mono">
              <span>-50</span>
              <span>0</span>
              <span>+50</span>
            </div>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {tuning.notes.map((note, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-md flex items-center justify-center font-mono text-sm font-bold
                  ${currentNote?.startsWith(note) ? 'bg-emerald-500/30 border-emerald-500 border' : 'bg-neutral-800'}`}
              >
                {note}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <p className="text-[10px] text-muted-foreground text-center">
              Play a note and watch the needle - center = in tune
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
