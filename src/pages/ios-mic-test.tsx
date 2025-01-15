import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const iOSMicTest = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<string>("");
  const [currentSize, setCurrentSize] = useState<number>(0);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [sizePerMinute, setSizePerMinute] = useState<number>(0);
  
  // Audio quality settings
  const [bitRate, setBitRate] = useState<number>(32000); // 32 kbps
  const [sampleRate, setSampleRate] = useState<number>(22050); // 22.05 kHz
  const [channels, setChannels] = useState<number>(1); // mono

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const sizeCheckIntervalRef = useRef<number | null>(null);

  // Get device info on mount
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    setDeviceInfo(`
      User Agent: ${userAgent}
      Platform: ${navigator.platform}
      Is iOS: ${isIOS}
      Vendor: ${navigator.vendor}
      
      Supported Format: audio/mp4
    `);
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (sizeCheckIntervalRef.current) {
        window.clearInterval(sizeCheckIntervalRef.current);
      }
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateFileSize = () => {
    const totalSize = recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
    setCurrentSize(totalSize);
    
    // Calculate size per minute
    const durationMinutes = (Date.now() - recordingStartTimeRef.current) / 60000;
    if (durationMinutes > 0) {
      setSizePerMinute(totalSize / durationMinutes);
    }
    
    // Update duration
    setRecordingDuration((Date.now() - recordingStartTimeRef.current) / 1000);
  };

  const startRecording = async () => {
    try {
      setError(null);
      setCurrentSize(0);
      setSizePerMinute(0);
      setRecordingDuration(0);
      
      const constraints = {
        audio: {
          channelCount: channels,
          sampleRate: sampleRate,
          // Note: Some of these might be ignored by iOS
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      console.log("Starting recording with settings:", {
        bitRate,
        sampleRate,
        channels,
        constraints
      });

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/mp4',
        audioBitsPerSecond: bitRate
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          updateFileSize();
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/mp4' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        updateFileSize();
      };

      // Request data every second for size updates
      mediaRecorder.start(1000);
      setRecording(true);

      // Start size monitoring
      sizeCheckIntervalRef.current = window.setInterval(updateFileSize, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setRecording(false);
      
      if (sizeCheckIntervalRef.current) {
        window.clearInterval(sizeCheckIntervalRef.current);
        sizeCheckIntervalRef.current = null;
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>iOS Microphone Test (MP4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{deviceInfo}</pre>
            </div>

            {/* Audio Quality Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bit Rate: {bitRate / 1000} kbps</Label>
                <Slider
                  value={[bitRate]}
                  min={8000}
                  max={128000}
                  step={1000}
                  onValueChange={(value) => setBitRate(value[0])}
                  disabled={recording}
                />
              </div>

              <div className="space-y-2">
                <Label>Sample Rate: {sampleRate / 1000} kHz</Label>
                <Select
                  value={sampleRate.toString()}
                  onValueChange={(value) => setSampleRate(parseInt(value))}
                  disabled={recording}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8000">8 kHz</SelectItem>
                    <SelectItem value="11025">11.025 kHz</SelectItem>
                    <SelectItem value="22050">22.05 kHz</SelectItem>
                    <SelectItem value="44100">44.1 kHz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Channels</Label>
                <Select
                  value={channels.toString()}
                  onValueChange={(value) => setChannels(parseInt(value))}
                  disabled={recording}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Mono</SelectItem>
                    <SelectItem value="2">Stereo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="space-x-2">
              {!recording ? (
                <Button onClick={startRecording} variant="default">
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive">
                  Stop Recording
                </Button>
              )}
            </div>

            {/* Recording Stats */}
            {recording && (
              <div className="space-y-2 bg-muted p-4 rounded-lg">
                <p>Current Size: {formatFileSize(currentSize)}</p>
                <p>Duration: {recordingDuration.toFixed(1)}s</p>
                <p>Size per Minute: {formatFileSize(sizePerMinute)}/min</p>
                <p>Estimated 1hr Size: {formatFileSize(sizePerMinute * 60)}</p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                <p>Error: {error}</p>
              </div>
            )}

            {audioURL && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Recorded Audio:</h2>
                <p>Final Size: {formatFileSize(currentSize)}</p>
                <audio controls src={audioURL} className="w-full" />
                <Button asChild variant="outline">
                  <a href={audioURL} download="ios_test_recording.mp4">
                    Download Audio
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default iOSMicTest;
