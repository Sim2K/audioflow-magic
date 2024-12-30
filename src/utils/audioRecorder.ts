export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async startRecording(): Promise<void> {
    try {
      if (this.mediaRecorder?.state === "recording") {
        return; // Already recording
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording and request data every 1 second
      this.mediaRecorder.start(1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw new Error("Could not access microphone. Please check permissions.");
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No recording in progress"));
        return;
      }

      if (this.mediaRecorder.state !== "recording") {
        reject(new Error("Recording is not active"));
        return;
      }

      const cleanup = () => {
        if (this.mediaRecorder?.stream) {
          this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
      };

      const handleDataAvailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.ondataavailable = handleDataAvailable;

      this.mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { 
            type: 'audio/webm' 
          });
          cleanup();
          resolve(audioBlob);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      try {
        // Request any remaining data
        this.mediaRecorder.requestData();
        // Stop the recording
        this.mediaRecorder.stop();
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}