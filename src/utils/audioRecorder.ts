export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private chunkInterval: number = 250;
  private lastChunkTime: number = 0;
  private mediaStream: MediaStream | null = null;
  private recordingStartTime: number = 0;
  private readonly MAX_DURATION_MS: number = 4200000; // 70 minutes

  async startRecording(): Promise<void> {
    try {
      if (this.isRecording || this.mediaRecorder?.state === "recording") {
        return; // Already recording
      }

      console.log('Requesting media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000, // Better quality sample rate for speech
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      console.log('Media stream obtained');

      this.mediaStream = stream;
      this.recordingStartTime = Date.now();

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 48000 // Optimized bitrate for 24MB/70min with good quality
      });

      this.audioChunks = [];
      this.isRecording = true;
      this.lastChunkTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.lastChunkTime = Date.now();

          // Check recording duration
          const duration = Date.now() - this.recordingStartTime;
          if (duration >= this.MAX_DURATION_MS) {
            console.log('Maximum recording duration reached (70 minutes)');
            this.stopRecording().catch(console.error);
          }
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.cleanup();
      };

      // Start recording with smaller chunks for more frequent updates
      this.mediaRecorder.start(this.chunkInterval);
      console.log('Recording started with stream:', this.mediaStream.id);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      this.cleanup();
      throw new Error("Could not access microphone. Please check permissions.");
    }
  }

  cleanup(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.removeEventListener('dataavailable', () => {});
      this.mediaRecorder.removeEventListener('error', () => {});
      this.mediaRecorder = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.audioChunks = [];
    this.isRecording = false;
    this.lastChunkTime = 0;
  }

  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.isRecording || !this.mediaRecorder) {
        reject(new Error("No recording in progress"));
        return;
      }

      // Check if we've received chunks recently
      const timeSinceLastChunk = Date.now() - this.lastChunkTime;
      if (timeSinceLastChunk > 5000) { // 5 seconds threshold
        console.warn('Long gap since last chunk, recording may be stale');
      }

      const handleStop = () => {
        try {
          if (this.audioChunks.length === 0) {
            throw new Error("No audio data collected");
          }
          
          const audioBlob = new Blob(this.audioChunks, { 
            type: 'audio/webm;codecs=opus'
          });
          this.cleanup();
          resolve(audioBlob);
        } catch (error) {
          this.cleanup();
          reject(error);
        }
      };

      try {
        if (this.mediaRecorder.state === "recording") {
          this.mediaRecorder.onstop = handleStop;
          this.mediaRecorder.stop();
        } else {
          handleStop();
        }
      } catch (error) {
        this.cleanup();
        reject(error);
      }
    });
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording && !!this.mediaRecorder;
  }
}