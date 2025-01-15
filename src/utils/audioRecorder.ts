export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private chunkInterval: number = 2000;
  private lastChunkTime: number = 0;
  private mediaStream: MediaStream | null = null;
  private recordingStartTime: number = 0;
  private readonly MAX_DURATION_MS: number = 4200000; // 70 minutes
  private totalSize: number = 0;
  private audioContext: AudioContext | null = null;

  private async createMonoStream(stream: MediaStream): Promise<MediaStream> {
    // Create audio context with forced sample rate
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 22050, // Optimized for speech
      latencyHint: 'interactive'
    });
    
    // Create source from input stream
    const source = this.audioContext.createMediaStreamSource(stream);
    
    // Create script processor for mono conversion
    const processor = this.audioContext.createScriptProcessor(2048, 2, 1);
    
    // Create destination
    const dest = this.audioContext.createMediaStreamDestination();
    
    // Process audio to ensure mono
    processor.onaudioprocess = (e) => {
      const inputBuffer = e.inputBuffer;
      const outputBuffer = e.outputBuffer;
      
      // Convert to mono by averaging channels
      const outputData = outputBuffer.getChannelData(0);
      for (let i = 0; i < outputBuffer.length; i++) {
        let sum = 0;
        for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
          sum += inputBuffer.getChannelData(channel)[i];
        }
        outputData[i] = sum / inputBuffer.numberOfChannels;
      }
    };
    
    // Connect the audio nodes
    source.connect(processor);
    processor.connect(dest);
    
    // Log actual settings
    const track = dest.stream.getAudioTracks()[0];
    console.log('Audio settings after processing:', track.getSettings());
    
    return dest.stream;
  }

  async startRecording(): Promise<void> {
    try {
      if (this.isRecording || this.mediaRecorder?.state === "recording") {
        return;
      }

      console.log('Requesting media stream...');
      const initialStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 22050,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Force mono audio using Web Audio API
      const monoStream = await this.createMonoStream(initialStream);
      this.mediaStream = monoStream;
      this.recordingStartTime = Date.now();
      this.totalSize = 0;

      // Configure for MP4 with optimal quality settings
      this.mediaRecorder = new MediaRecorder(monoStream, {
        mimeType: 'audio/mp4',
        audioBitsPerSecond: 32000  // Balanced quality for speech
      });

      this.audioChunks = [];
      this.isRecording = true;
      this.lastChunkTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.totalSize += event.data.size;
          this.lastChunkTime = Date.now();

          // Log effective bitrate and projected size
          const duration = (Date.now() - this.recordingStartTime) / 1000;
          const effectiveBitrate = (this.totalSize * 8) / duration;
          const projectedSize = (effectiveBitrate * this.MAX_DURATION_MS) / (8 * 1000 * 1024 * 1024);
          
          console.log(`Recording stats:
            - Duration: ${duration.toFixed(1)}s
            - Total size: ${(this.totalSize / (1024 * 1024)).toFixed(2)}MB
            - Effective bitrate: ${(effectiveBitrate / 1000).toFixed(1)}kbps
            - Projected 70min size: ${projectedSize.toFixed(2)}MB`);

          // Check recording duration
          if (duration * 1000 >= this.MAX_DURATION_MS) {
            console.log('Maximum recording duration reached');
            this.stopRecording().catch(console.error);
          }

          // Check if projected size exceeds limit
          if (projectedSize > 24) {
            console.warn('Warning: Projected file size exceeds 24MB limit');
          }
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.cleanup();
      };

      this.mediaRecorder.start(this.chunkInterval);
      console.log('Recording started with MP4 format');
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

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioChunks = [];
    this.isRecording = false;
    this.lastChunkTime = 0;
    this.totalSize = 0;
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
      if (timeSinceLastChunk > 5000) {
        console.warn('Long gap since last chunk, recording may be stale');
      }

      const handleStop = () => {
        try {
          if (this.audioChunks.length === 0) {
            throw new Error("No audio data collected");
          }
          
          const audioBlob = new Blob(this.audioChunks, { 
            type: 'audio/mp4'
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
    return this.isRecording;
  }
}