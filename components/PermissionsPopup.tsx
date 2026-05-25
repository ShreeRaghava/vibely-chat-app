"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PermissionsPopupProps = {
  isOpen: boolean;
  onComplete: (permissions: { camera: boolean; microphone: boolean; location: string | null }) => void;
};

export default function PermissionsPopup({ isOpen, onComplete }: PermissionsPopupProps) {
  const [cameraPermission, setCameraPermission] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRequestPermissions = async () => {
    setError('');
    setIsRetrying(true);
    
    console.log('[PERMISSIONS] Requesting camera and microphone access...');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('❌ Your browser does not support camera/microphone.\n\nPlease use:\n• Chrome\n• Firefox\n• Safari\n• Edge');
        setIsRetrying(false);
        return;
      }

      console.log('[PERMISSIONS] Calling getUserMedia()...');
      
      // Request BOTH camera and microphone together
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      console.log('[PERMISSIONS] ✅ Got camera and microphone access!');
      
      const hasVideo = stream.getVideoTracks().length > 0;
      const hasAudio = stream.getAudioTracks().length > 0;
      
      console.log('[PERMISSIONS] Video tracks:', hasVideo, 'Audio tracks:', hasAudio);
      
      // Stop the test stream immediately (we'll get a fresh one in video call)
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      setCameraPermission(hasVideo);
      setMicrophonePermission(hasAudio);
      setError('');
      
      // Immediately complete - proceed to video call
      onComplete({ 
        camera: hasVideo, 
        microphone: hasAudio,
        location: null
      });
      
      console.log('[PERMISSIONS] ✓ Permissions ready - starting video call');
    } catch (err: any) {
      console.error('[PERMISSIONS] ❌ Error:', {
        name: err.name,
        message: err.message,
        code: err.code,
      });

      let errorMsg = '';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = `❌ BROWSER PERMISSION DENIED\n\nThe browser blocked access. This is NOT an app error - it's your browser settings.\n\n**FIX:**\n• Chrome: Address bar → 📷 Camera icon → "Always allow" or "Allow"\n• Firefox: Settings → Privacy → Permissions → Camera & Microphone → "Allow"\n• Safari: System Preferences → Security → Camera/Microphone\n• Edge: Settings → Privacy → Camera & Microphone → "Allow"\n\nThen try again.`;
      } else if (err.name === 'NotFoundError') {
        errorMsg = '❌ No camera or microphone found\n\nPlease connect a camera and microphone to your device.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = '❌ Camera/microphone is BUSY\n\nAnother app is using it (Zoom, Skype, Discord, etc.)\n\nClose other apps and try again.';
      } else if (err.name === 'SecurityError') {
        errorMsg = '❌ HTTPS Required\n\nThis must run on a secure connection (HTTPS), not HTTP.';
      } else if (err.name === 'AbortError') {
        errorMsg = '❌ Permission request cancelled\n\nYou cancelled the browser permission popup. Try again.';
      } else {
        errorMsg = `❌ Error: ${err.message || 'Unknown error'}\n\nTry clicking "Retry" below.`;
      }

      setError(errorMsg);
      setIsRetrying(false);
    }
  };

  const handleSkipVideo = () => {
    console.log('User chose text chat only');
    // Skip video - proceed with chat only (no permissions needed)
    onComplete({ 
      camera: false, 
      microphone: false,
      location: null
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-3">📹 Video Call</h2>
              <p className="text-base text-slate-600">
                We need your camera and microphone for video calls
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 text-xs rounded-2xl border border-red-300 whitespace-pre-line max-h-64 overflow-y-auto">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleRequestPermissions}
                disabled={isRetrying}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? '⏳ Connecting...' : error ? '🔄 Try Again' : '✅ Allow Camera & Mic'}
              </button>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-sm text-blue-900">
                <p className="font-semibold mb-2">💡 What happens next:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Browser will ask for camera & microphone</li>
                  <li>✓ Click ALLOW for both</li>
                  <li>✓ You'll be ready to video call</li>
                </ul>
              </div>

              <button
                onClick={handleSkipVideo}
                className="w-full bg-slate-200 text-slate-900 py-3 rounded-2xl font-semibold hover:bg-slate-300 transition"
              >
                💬 Text Chat Only (Skip Video)
              </button>

              <p className="text-xs text-slate-500 text-center">
                You can enable video later in settings
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
