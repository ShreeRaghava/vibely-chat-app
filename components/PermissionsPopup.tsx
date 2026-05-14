"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PermissionsPopupProps = {
  isOpen: boolean;
  onComplete: (permissions: { camera: boolean; microphone: boolean; location: string | null }) => void;
};

export default function PermissionsPopup({ isOpen, onComplete }: PermissionsPopupProps) {
  const [step, setStep] = useState<'camera' | 'location' | 'complete'>('camera');
  const [cameraPermission, setCameraPermission] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleCameraAllow = async () => {
    setError('');
    setIsRetrying(true);
    
    console.log('Requesting camera and microphone access...');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Your browser does not support camera/microphone. Please use Chrome, Firefox, Safari, or Edge.');
        setIsRetrying(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log('Got stream with both camera and microphone:', stream);
      
      const hasVideo = stream.getVideoTracks().length > 0;
      const hasAudio = stream.getAudioTracks().length > 0;
      
      console.log('Video tracks:', hasVideo, 'Audio tracks:', hasAudio);
      
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      setCameraPermission(hasVideo);
      setMicrophonePermission(hasAudio);
      setStep('location');
      setError('');
      console.log('Camera and microphone permissions granted');
    } catch (err: any) {
      console.error('Media permission error:', {
        name: err.name,
        message: err.message,
      });

      let errorMsg = '';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'You clicked DENY. Click "Allow" again and make sure to click ALLOW for both camera and microphone in the browser popup.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera or microphone found. Please connect a camera and check your microphone.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera or microphone is in use by another app. Please close other apps and try again.';
      } else if (err.name === 'SecurityError') {
        errorMsg = 'Media access requires HTTPS. Make sure you\'re using a secure URL.';
      } else if (err.name === 'AbortError') {
        errorMsg = 'Permission request was cancelled. Please try again.';
      } else {
        errorMsg = `Media error: ${err.message || err.name || 'Unknown'}. Please try again.`;
      }

      setError(errorMsg);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSkipCamera = () => {
    console.log('User skipped camera permission');
    setCameraPermission(false);
    setMicrophonePermission(false);
    setStep('location');
    setError('');
  };

  const handleLocationAllow = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationStr = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
        setLocation(locationStr);
        setStep('complete');
        setError('');
      },
      (err) => {
        setError('Location permission denied. Try entering a location manually.');
        console.error('Location error:', err);
      },
      { timeout: 10000 }
    );
  };

  const handleManualLocation = () => {
    if (!location.trim()) {
      setError('Please enter a location.');
      return;
    }
    setStep('complete');
    setError('');
  };

  const handleSkipLocation = () => {
    setStep('complete');
    setError('');
  };

  const handleComplete = () => {
    if (cameraPermission || microphonePermission || location.trim()) {
      onComplete({ 
        camera: cameraPermission, 
        microphone: microphonePermission,
        location: location || null 
      });
    } else {
      setError('Please allow camera, microphone, or enter a location to continue.');
    }
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
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-2">
              {step === 'camera' && 'Enable Camera & Microphone'}
              {step === 'location' && 'Share Your Location'}
              {step === 'complete' && 'Ready to Connect!'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {step === 'camera' && 'We need access to your camera and microphone for video calls. Click Allow when the browser asks.'}
              {step === 'location' && 'Share your location to match with people near you.'}
              {step === 'complete' && 'All set! You can now start video calling.'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-2xl border border-red-300">
                {error}
              </div>
            )}

            {step === 'camera' && (
              <div className="space-y-3">
                <button
                  onClick={handleCameraAllow}
                  disabled={isRetrying}
                  className="w-full bg-slate-950 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? 'Requesting Access...' : 'Allow Camera & Mic'}
                </button>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl">
                  💡 A browser popup will appear. Click <strong>ALLOW</strong> for both <strong>Camera</strong> and <strong>Microphone</strong>.
                </div>
                <button
                  onClick={handleSkipCamera}
                  className="w-full bg-slate-200 text-slate-950 py-3 rounded-2xl font-semibold hover:bg-slate-300 transition"
                >
                  Skip & Use Text Chat
                </button>
              </div>
            )}

            {step === 'location' && (
              <div className="space-y-3">
                <button
                  onClick={handleLocationAllow}
                  className="w-full bg-slate-950 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
                >
                  Use My Location
                </button>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Or enter city/area..."
                  className="w-full p-3 border border-slate-300 rounded-2xl focus:outline-none focus:border-slate-950"
                />
                <button
                  onClick={handleManualLocation}
                  disabled={!location.trim()}
                  className="w-full bg-slate-950 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue with Location
                </button>
                <button
                  onClick={handleSkipLocation}
                  className="w-full bg-slate-200 text-slate-950 py-3 rounded-2xl font-semibold hover:bg-slate-300 transition"
                >
                  Skip Location
                </button>
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-2xl flex-wrap">
                  {cameraPermission && <span className="text-2xl">📹</span>}
                  {microphonePermission && <span className="text-2xl">🎤</span>}
                  {location && <span className="text-2xl">📍</span>}
                  <span className="text-green-700 font-medium text-sm">
                    {[
                      cameraPermission && 'Camera',
                      microphonePermission && 'Mic',
                      location && 'Location'
                    ].filter(Boolean).join(', ')} ready!
                  </span>
                </div>
                <button
                  onClick={handleComplete}
                  className="w-full bg-slate-950 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
                >
                  Start Video Call
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
