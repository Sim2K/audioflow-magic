import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface RecordingTimerProps {
  isRecording: boolean;
  startTime: number | null;
}

export function RecordingTimer({ isRecording, startTime }: RecordingTimerProps) {
  const [elapsed, setElapsed] = useState<string>("00:00");

  useEffect(() => {
    if (!isRecording || !startTime) {
      setElapsed("00:00");
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording, startTime]);

  if (!isRecording) return null;

  return (
    <div className="w-full bg-muted/30 rounded-lg p-4 my-4">
      <div className="w-full h-[80px] md:h-[120px] flex items-center justify-center">
        <div className="text-4xl font-mono font-semibold">
          {elapsed}
        </div>
      </div>
    </div>
  );
}
