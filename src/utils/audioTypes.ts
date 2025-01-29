export interface AudioFormatConfig {
  mimeType: string;
  codec: string;
  extension: string;
  bitrate: number;
  sampleRate: number;
}

// Define all supported MIME types for each format
export const mimeTypes = {
  webm: ['audio/webm;codecs=opus', 'audio/webm'],
  mp4: [
    'audio/mp4',
    'audio/mp4;codecs=mp4a',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4;codecs=aac',
    'audio/mp4;codecs=alac',
    'audio/aac'
  ]
} as const;

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
    codec: 'mp4a',
    extension: 'm4a',
    bitrate: 16000,
    sampleRate: 16000
  }
} as const;

export type SupportedFormat = keyof typeof formatConfigs;

export interface RecorderConfig {
  format: SupportedFormat;
  config: AudioFormatConfig;
}
