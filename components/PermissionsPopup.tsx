"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PermissionsPopupProps = {
  isOpen: boolean;
  onComplete: (permissions: { camera: boolean; location: string | null }) => void;
};

export default function PermissionsPopup({ isOpen, onComplete }: PermissionsPopupProps) {
  const [step, setStep] = useState<'camera' | 'complete'>('camera');
  const [cameraPermission, setCameraPermission] = useState(false);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleCameraAllow = async () => {
    setError('');
    setIsRetrying(true);
    
    console.log('Starting camera+microphone permission request...');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        const msg = 'Your browser does not support camera/microphone access. Please use Chrome, Firefox, Safari, or Edge.';
        setError(msg);
        setIsRetrying(false);
        return;
      }

      console.log('Browser supports getUserMedia, requesting camera and microphone access...');

      // Request both camera and microphone together
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log('Got stream successfully with camera and microphone:', stream);
      
      // Stop the test stream - we just needed to verify permissions
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      setCameraPermission(true);
      setStep('complete');
      setError('');
      console.log('Camera and microphone permissions granted');
    } catch (err: any) {
      console.error('Camera/Microphone permission error:', {
        name: err.name,
        message: err.message,
        code: err.code,
      });

      let errorMsg = '';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera/microphone access was denied. Please click "Allow Camera & Mic" and make sure to click ALLOW in the browser popup.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera or microphone device found. Please connect a camera and microphone.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Your camera or microphone is in use by another application.';
      } else if (err.name === 'SecurityError') {
        errorMsg = 'Camera access requires HTTPS. Make sure you\'re using a secure URL (https://).';
      } else if (err.name === 'TypeError') {
        errorMsg = 'Camera/microphone request is invalid. Your browser may not support this.';
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
    setStep('complete');
    setError('');
  };

  const handleComplete = () => {
    // Just pass camera permission - no location needed
    onComplete({ camera: cameraPermission, location: null });
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
              {step === 'camera' && 'Enable Camera & Microphone'}
              {step === 'complete' && 'Ready to Connect!'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {step === 'camera' && 'Allow camera and microphone access to start a video call. Click ALLOW in the browser popup.'}
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
                  {isRetrying ? 'Requesting Access...' : 'Allow Camera & Mic'}
                </button>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl">
                  💡 <strong>Tip:</strong> A browser popup will appear. Click <strong>ALLOW</strong> for both camera and microphone.
                </div>
                <button
                  onClick={handleSkipCamera}
                  className="w-full bg-slate-200 text-slate-950 py-3 rounded-2xl font-semibold hover:bg-slate-300 transition"
                >
                  Skip & Use Text Chat
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
