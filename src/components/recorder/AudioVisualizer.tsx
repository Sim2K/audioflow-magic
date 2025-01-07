import { useEffect, useRef } from 'react';
import { FrequencySpectrum } from './FrequencySpectrum';

interface AudioVisualizerProps {
  isRecording: boolean;
  mediaStream: MediaStream | null;
}

export function AudioVisualizer({ isRecording, mediaStream }: AudioVisualizerProps) {
  if (!isRecording) return null;

  return (
    <div className="w-full bg-muted/30 rounded-lg p-4 my-4">
      <div className="w-full h-[80px] md:h-[120px]">
        <FrequencySpectrum 
          isRecording={isRecording}
          mediaStream={mediaStream}
        />
      </div>
    </div>
  );
}
