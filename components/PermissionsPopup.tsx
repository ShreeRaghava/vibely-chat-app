"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PermissionsPopupProps = {
  isOpen: boolean;
  onComplete: (permissions: { camera: boolean; location: string | null }) => void;
};

export default function PermissionsPopup({ isOpen, onComplete }: PermissionsPopupProps) {
  const [step, setStep] = useState<'camera' | 'location' | 'complete'>('camera');
  const [location, setLocation] = useState('');
  const [cameraPermission, setCameraPermission] = useState(false);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleCameraAllow = async () => {
    setError('');
    setIsRetrying(true);
    
    console.log('Starting camera permission request...');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        const msg = 'Your browser does not support camera access. Please use Chrome, Firefox, Safari, or Edge.';
        setError(msg);
        setIsRetrying(false);
        return;
      }

      console.log('Browser supports getUserMedia, requesting camera access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log('Got stream successfully:', stream);
      
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      setCameraPermission(true);
      setStep('location');
      setError('');
      console.log('Camera permission granted, moving to location step');
    } catch (err: any) {
      console.error('Camera permission error:', {
        name: err.name,
        message: err.message,
        code: err.code,
      });

      let errorMsg = '';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'You clicked DENY for camera access. Click "Allow Camera" again and make sure to click ALLOW in the browser popup.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera device found. Please connect a camera or check if it\'s being used by another app.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Your camera is in use by another application. Please close that app and try again.';
      } else if (err.name === 'SecurityError') {
        errorMsg = 'Camera access requires HTTPS. Make sure you\'re using a secure URL (https://).';
      } else if (err.name === 'TypeError') {
        errorMsg = 'Camera request is invalid. Your browser may not support this.';
      } else if (err.name === 'AbortError') {
        errorMsg = 'Camera access was cancelled. Please try again.';
      } else {
        errorMsg = `Camera error: ${err.message || err.name || 'Unknown'}. Please try again.`;
      }

      setError(errorMsg);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSkipCamera = () => {
    console.log('User skipped camera permission');
    setCameraPermission(true);
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

  const handleComplete = () => {
    if (cameraPermission || location.trim()) {
      onComplete({ camera: cameraPermission, location: location || null });
    } else {
      setError('Please allow camera or enter a location to continue.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-2">
              {step === 'camera' && 'Enable Camera'}
              {step === 'location' && 'Share Your Location'}
              {step === 'complete' && 'Ready to Connect!'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {step === 'camera' && 'When you click Allow, the browser will ask for permission. Click ALLOW in the popup.'}
              {step === 'location' && 'Share your location to match with people near you.'}
              {step === 'complete' && 'Ready to start connecting!'}
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
                  {isRetrying ? 'Requesting Camera...' : 'Allow Camera'}
                </button>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl">
                  💡 <strong>Tip:</strong> A browser popup will appear asking for camera permission. Click <strong>ALLOW</strong>.
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
                {!location && (
                  <button
                    onClick={handleLocationAllow}
                    className="w-full bg-slate-950 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
                  >
                    Use My Location
                  </button>
                )}
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
              </div>
            )}

            {step === 'complete' && (
              <button
                onClick={handleComplete}
                className="w-full bg-slate-950 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
              >
                Start Video Call
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
