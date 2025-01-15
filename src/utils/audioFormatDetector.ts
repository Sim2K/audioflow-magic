export interface AudioFormatSupport {
  isWebMSupported: boolean;
  isMp4Supported: boolean;
  preferredFormat: 'webm' | 'mp4';
}

export function detectAudioSupport(): AudioFormatSupport {
  const support = {
    isWebMSupported: false,
    isMp4Supported: false,
    preferredFormat: 'webm' as const
  };

  // Check WebM support
  try {
    support.isWebMSupported = MediaRecorder.isTypeSupported('audio/webm;codecs=opus');
  } catch (e) {
    console.warn('WebM support check failed:', e);
  }

  // Check MP4 support
  try {
    support.isMp4Supported = MediaRecorder.isTypeSupported('audio/mp4;codecs=aac');
  } catch (e) {
    console.warn('MP4 support check failed:', e);
  }

  // Determine preferred format
  // Prefer MP4 on Safari/iOS, WebM elsewhere if supported
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if ((isSafari || isIOS) && support.isMp4Supported) {
    support.preferredFormat = 'mp4';
  } else if (support.isWebMSupported) {
    support.preferredFormat = 'webm';
  } else if (support.isMp4Supported) {
    support.preferredFormat = 'mp4';
  }

  return support;
}
