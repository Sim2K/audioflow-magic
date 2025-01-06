import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface FrequencySpectrumProps {
  isRecording: boolean;
  mediaStream: MediaStream | null;
  className?: string;
}

export function FrequencySpectrum({ 
  isRecording, 
  mediaStream, 
  className 
}: FrequencySpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const initializeAudioAnalyzer = useCallback(() => {
    if (!mediaStream) {
      console.log('No media stream available');
      return;
    }

    try {
      console.log('Initializing audio analyzer...');
      
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Create analyzer if it doesn't exist
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
        console.log('Analyzer created');
      }

      // Create and connect source
      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaStreamSource(mediaStream);
        sourceRef.current.connect(analyserRef.current);
        console.log('Media stream connected to analyzer');
      }

      // Create data array for frequency data
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

    } catch (error) {
      console.error('Error initializing audio analyzer:', error);
    }
  }, [mediaStream]);

  const drawSpectrum = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !isRecording || !dataArrayRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get frequency data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const frequencies = dataArrayRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up dimensions
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = (width / frequencies.length) * 2.5;
    
    // Draw frequency bars
    frequencies.forEach((frequency, i) => {
      const percent = frequency / 255;
      const h = height * percent;
      const x = i * barWidth;
      
      // Create gradient based on frequency
      const gradient = ctx.createLinearGradient(0, height, 0, height - h);
      gradient.addColorStop(0, 'rgb(147, 51, 234)'); // Purple
      gradient.addColorStop(0.5, 'rgb(59, 130, 246)'); // Blue
      gradient.addColorStop(1, 'rgb(34, 197, 94)'); // Green
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - h, barWidth * 0.8, h);
    });

    // Request next frame
    animationFrameRef.current = requestAnimationFrame(drawSpectrum);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && mediaStream) {
      console.log('Setting up audio visualization');
      initializeAudioAnalyzer();
      drawSpectrum();
    }

    return () => {
      console.log('Cleaning up audio visualization');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [isRecording, mediaStream, initializeAudioAnalyzer, drawSpectrum]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "w-full h-full rounded-lg bg-black/10",
        className
      )}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
