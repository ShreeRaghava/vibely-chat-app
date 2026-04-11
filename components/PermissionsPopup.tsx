"use client";

import { useState, useEffect } from 'react';
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

  const handleCameraAllow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission(true);
      setStep('location');
      setError('');
    } catch (err) {
      setError('Camera permission denied. Please enable it in browser settings.');
      console.error('Camera error:', err);
    }
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

  const handleLocationSkip = () => {
    if (!location.trim()) {
      setError('Please enter a location or allow location access.');
      return;
    }
    setStep('complete');
    setError('');
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
    if (cameraPermission) {
      onComplete({ camera: true, location: location || null });
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
              {step === 'complete' && 'All Set!'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {step === 'camera' && 'We need camera access to help you connect with people nearby.'}
              {step === 'location' && 'Share your location to match with people in your area.'}
              {step === 'complete' && 'You\'re ready to start video calling!'}
            </p>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-2xl">{error}</div>}

            {step === 'camera' && (
              <div className="space-y-3">
                <button
                  onClick={handleCameraAllow}
                  className="w-full bg-slate-950 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
                >
                  Allow Camera
                </button>
                <button
                  onClick={() => setStep('location')}
                  className="w-full bg-slate-200 text-slate-950 py-3 rounded-2xl font-semibold hover:bg-slate-300 transition"
                >
                  Skip for Now
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
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Or enter a city/area..."
                    className="w-full p-3 border border-slate-300 rounded-2xl focus:outline-none focus:border-slate-950"
                  />
                </div>
                <button
                  onClick={handleManualLocation}
                  className="w-full bg-slate-950 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                  disabled={!location.trim()}
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
