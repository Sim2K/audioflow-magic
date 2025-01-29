export interface AudioFormatSupport {
  isWebMSupported: boolean;
  isMp4Supported: boolean;
  preferredFormat: 'webm' | 'mp4';
}

function isIOSDevice(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const platform = navigator.platform || '';
  
  // iOS 13+ iPad detection
  if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(platform)) {
    return true;
  }
  
  return /iPhone|iPod|iPad/.test(userAgent) || /iPhone|iPod|iPad/.test(platform);
}

function getAudioSupport(): { webm: boolean, mp4: boolean } {
  const support = {
    webm: false,
    mp4: false
  };

  try {
    // Test each possible MIME type
    const mimeTypes = {
      webm: ['audio/webm;codecs=opus', 'audio/webm'],
      mp4: [
        'audio/mp4',
        'audio/mp4;codecs=mp4a.40.2',
        'audio/mp4;codecs=aac',
        'audio/aac'
      ]
    };

    // Check WebM support
    support.webm = mimeTypes.webm.some(mime => {
      try {
        return MediaRecorder.isTypeSupported(mime);
      } catch {
        return false;
      }
    });

    // Check MP4 support
    support.mp4 = mimeTypes.mp4.some(mime => {
      try {
        return MediaRecorder.isTypeSupported(mime);
      } catch {
        return false;
      }
    });
  } catch (e) {
    console.warn('Error checking codec support:', e);
  }

  return support;
}

export function detectAudioSupport(): AudioFormatSupport {
  const isIOS = isIOSDevice();
  const codecSupport = getAudioSupport();

  // Log detailed environment info
  console.log('Audio Environment:', {
    isIOS,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    codecSupport,
    mediaRecorderExists: typeof MediaRecorder !== 'undefined'
  });

  // On iOS, always use MP4/AAC regardless of detected support
  if (isIOS) {
    return {
      isWebMSupported: false,
      isMp4Supported: true,
      preferredFormat: 'mp4'
    };
  }

  // For all other devices, use detected support
  return {
    isWebMSupported: codecSupport.webm,
    isMp4Supported: codecSupport.mp4,
    preferredFormat: codecSupport.webm ? 'webm' : 'mp4'
  };
}
