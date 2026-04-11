"use client";

import { motion, AnimatePresence } from 'framer-motion';

type IncomingCallPopupProps = {
  isOpen: boolean;
  callerName?: string;
  onAccept: () => void;
  onDecline: () => void;
};

export default function IncomingCallPopup({
  isOpen,
  callerName = 'Stranger',
  onAccept,
  onDecline,
}: IncomingCallPopupProps) {
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
          >
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                <span className="text-5xl">📞</span>
              </div>
              <h2 className="text-2xl font-bold">Incoming Call</h2>
              <p className="mt-2 text-slate-600">{callerName} is calling...</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onDecline}
                className="flex-1 rounded-full bg-red-100 py-4 text-lg font-semibold text-red-600 transition hover:bg-red-200"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 rounded-full bg-green-100 py-4 text-lg font-semibold text-green-600 transition hover:bg-green-200"
              >
                Accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
