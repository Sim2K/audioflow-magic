import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const iOSMicTest = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<string>("");
  const [constraints, setConstraints] = useState<MediaStreamConstraints>({ audio: true });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Get device info on component mount
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    setDeviceInfo(`
      User Agent: ${userAgent}
      Platform: ${navigator.platform}
      Is iOS: ${isIOS}
      Vendor: ${navigator.vendor}
    `);
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      console.log("Requesting media stream with constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Stream obtained:", stream);
      console.log("Audio tracks:", stream.getAudioTracks());
      
      // Log audio track settings
      const audioTrack = stream.getAudioTracks()[0];
      console.log("Audio track settings:", audioTrack.getSettings());
      console.log("Audio track constraints:", audioTrack.getConstraints());
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      console.log("MediaRecorder created:", mediaRecorder);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available event:", event);
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("Recording stopped");
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        recordedChunksRef.current = [];
      };

      mediaRecorder.start();
      setRecording(true);
      console.log("Recording started");
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
    }
  };

  const testWithDifferentConstraints = async () => {
    const testConstraints = [
      { audio: true },
      { audio: { echoCancellation: false } },
      { audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
      }},
      { audio: {
          channelCount: 1,
          sampleRate: 44100
      }}
    ];

    setConstraints(testConstraints[0]);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>iOS Microphone Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{deviceInfo}</pre>
            </div>

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
              
              <Button onClick={testWithDifferentConstraints} variant="outline">
                Test Different Constraints
              </Button>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                <p>Error: {error}</p>
              </div>
            )}

            <div className="space-y-2">
              <p>Current Constraints:</p>
              <pre className="bg-muted p-4 rounded-lg text-sm">
                {JSON.stringify(constraints, null, 2)}
              </pre>
            </div>

            {audioURL && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Recorded Audio:</h2>
                <audio controls src={audioURL} className="w-full" />
                <Button asChild variant="outline">
                  <a href={audioURL} download="ios_test_recording.webm">
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
