export interface AudioFormatSupport {
  isWebMSupported: boolean;
  isMp4Supported: boolean;
  preferredFormat: 'webm' | 'mp4';
}

function isIOSDevice(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  // Check for iPad first as it might report as MacIntel
  if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) {
    return true;
  }
  
  // Standard iOS detection
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
}

function isSafari(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('android');
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
    // Check multiple MP4 codec variations for broader device support
    support.isMp4Supported = (
      MediaRecorder.isTypeSupported('audio/mp4;codecs=aac') ||
      MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2') ||
      MediaRecorder.isTypeSupported('audio/aac')
    );
  } catch (e) {
    console.warn('MP4 support check failed:', e);
  }

  const isIOS = isIOSDevice();
  const isSafariBrowser = isSafari();

  console.log('Device detection:', {
    isIOS,
    isSafariBrowser,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    webmSupport: support.isWebMSupported,
    mp4Support: support.isMp4Supported
  });

  // Force MP4 for iOS devices regardless of detected support
  if (isIOS) {
    support.preferredFormat = 'mp4';
    // iOS Safari sometimes incorrectly reports codec support
    support.isMp4Supported = true;
    support.isWebMSupported = false;
  }
  // For Safari on desktop, prefer MP4 if supported
  else if (isSafariBrowser && support.isMp4Supported) {
    support.preferredFormat = 'mp4';
  }
  // For all other browsers, prefer WebM if supported
  else if (support.isWebMSupported) {
    support.preferredFormat = 'webm';
  }
  // Fallback to MP4 if WebM is not supported
  else if (support.isMp4Supported) {
    support.preferredFormat = 'mp4';
  }

  return support;
}
