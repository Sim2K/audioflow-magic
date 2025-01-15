export interface AudioFormatConfig {
  mimeType: string;
  codec: string;
  extension: string;
  bitrate: number;
  sampleRate: number;
}

export const formatConfigs = {
  webm: {
    mimeType: 'audio/webm',
    codec: 'opus',
    extension: 'webm',
    bitrate: 24000,
    sampleRate: 16000
  },
  mp4: {
    mimeType: 'audio/mp4',
    codec: 'aac',
    extension: 'm4a',
    bitrate: 32000,
    sampleRate: 16000
  }
} as const;

export type SupportedFormat = keyof typeof formatConfigs;

export interface RecorderConfig {
  format: SupportedFormat;
  config: AudioFormatConfig;
}
