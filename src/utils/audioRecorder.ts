import { AudioFormatConfig, RecorderConfig, formatConfigs, mimeTypes, SupportedFormat } from './audioTypes';
import { detectAudioSupport } from './audioFormatDetector';

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
  private recorderConfig: RecorderConfig;

  constructor() {
    const support = detectAudioSupport();
    this.recorderConfig = this.initializeRecorderConfig(support);
    console.log('AudioRecorder initialized with config:', this.recorderConfig);
  }

  private initializeRecorderConfig(support: { preferredFormat: SupportedFormat }): RecorderConfig {
    return {
      format: support.preferredFormat,
      config: formatConfigs[support.preferredFormat]
    };
  }

  private getSupportedMimeType(): string {
    const format = this.recorderConfig.format;
    const supportedMime = mimeTypes[format].find(mime => {
      try {
        return MediaRecorder.isTypeSupported(mime);
      } catch {
        return false;
      }
    });

    if (!supportedMime) {
      throw new Error(`No supported MIME type found for format: ${format}`);
    }

    return supportedMime;
  }

  private async createMonoStream(stream: MediaStream): Promise<MediaStream> {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.recorderConfig.config.sampleRate,
      latencyHint: 'interactive'
    });
    
    const source = this.audioContext.createMediaStreamSource(stream);
    const destination = this.audioContext.createMediaStreamDestination();

    // Simple mono mixing for all formats
    const monoMixer = this.audioContext.createChannelMerger(1);
    source.connect(monoMixer);
    monoMixer.connect(destination);
    
    const track = destination.stream.getAudioTracks()[0];
    console.log('Audio configuration:', {
      format: this.recorderConfig.format,
      sampleRate: this.recorderConfig.config.sampleRate,
      bitrate: this.recorderConfig.config.bitrate,
      actualSettings: track.getSettings()
    });
    
    return destination.stream;
  }

  async startRecording(): Promise<void> {
    try {
      if (this.isRecording || this.mediaRecorder?.state === "recording") {
        return;
      }

      console.log('Starting recording with format:', this.recorderConfig.format);
      
      const initialStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: this.recorderConfig.config.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      const monoStream = await this.createMonoStream(initialStream);
      this.mediaStream = monoStream;
      this.recordingStartTime = Date.now();
      this.totalSize = 0;

      const mimeType = this.getSupportedMimeType();
      console.log('Using MIME type:', mimeType);
      
      this.mediaRecorder = new MediaRecorder(monoStream, {
        mimeType,
        audioBitsPerSecond: this.recorderConfig.config.bitrate
      });

      this.audioChunks = [];
      this.isRecording = true;
      this.lastChunkTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.totalSize += event.data.size;
          this.lastChunkTime = Date.now();

          // Log effective bitrate
          const duration = (Date.now() - this.recordingStartTime) / 1000;
          const effectiveBitrate = (this.totalSize * 8) / duration;
          const projectedSize = (effectiveBitrate * this.MAX_DURATION_MS) / (8 * 1000 * 1024 * 1024);
          
          console.log(`Current recording stats:
            - Format: ${this.recorderConfig.format}
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
      console.log(`Recording started with format: ${this.recorderConfig.format}`);
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
      if (timeSinceLastChunk > 5000) { // 5 seconds threshold
        console.warn('Long gap since last chunk, recording may be stale');
      }

      const handleStop = () => {
        try {
          if (this.audioChunks.length === 0) {
            throw new Error("No audio data collected");
          }
          
          const mimeType = this.getSupportedMimeType();
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
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