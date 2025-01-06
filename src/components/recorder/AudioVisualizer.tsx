import { useEffect, useRef } from 'react';
import { FrequencySpectrum } from './FrequencySpectrum';

interface AudioVisualizerProps {
  isRecording: boolean;
  mediaStream: MediaStream | null;
}

export function AudioVisualizer({ isRecording, mediaStream }: AudioVisualizerProps) {
  if (!isRecording) return null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4 my-4">
      <div className="w-full h-[200px] md:h-[300px]">
        <FrequencySpectrum 
          isRecording={isRecording}
          mediaStream={mediaStream}
        />
      </div>
      <div className="w-full h-[200px] md:h-[300px] bg-muted/20 rounded-lg">
        {/* Reserved for future visualization */}
      </div>
    </div>
  );
}
