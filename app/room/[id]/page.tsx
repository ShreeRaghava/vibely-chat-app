"use client";

import { motion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Peer from 'peerjs';
import PermissionsPopup from '@/components/PermissionsPopup';
import IncomingCallPopup from '@/components/IncomingCallPopup';

type Message = {
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
};

export default function ChatRoom() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [roomConnected, setRoomConnected] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [guestId, setGuestId] = useState('');
  const currentUserId = ((session?.user as any)?.id as string) || guestId;
  const [chatError, setChatError] = useState('');
  const [showPermissions, setShowPermissions] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'active' | 'declined'>('idle');
  const [incomingCallVisible, setIncomingCallVisible] = useState(false);
  const [callInitiator, setCallInitiator] = useState('');
  const router = useRouter();

  const peerRef = useRef<Peer | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasCalledRef = useRef(false);
  const callAcceptedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedGuestId = window.localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(storedGuestId);
      return;
    }

    const newGuestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem('guestId', newGuestId);
    setGuestId(newGuestId);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!id || !currentUserId) {
      return;
    }

    try {
      const res = await fetch(`/api/chat/history?roomId=${encodeURIComponent(id)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await res.json();
      const formatted = (data.messages || []).map((msg: any) => ({
        text: msg.content,
        sender: msg.sender === currentUserId ? 'me' : 'them',
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(formatted);
      setRoomConnected(true);
    } catch (error) {
      console.error('Message load error:', error);
      setChatError('Unable to load room data. Please refresh the page.');
    }
  }, [id, currentUserId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Poll for incoming calls
  useEffect(() => {
    if (!isVideo || !id) return;

    const pollCalls = async () => {
      try {
        const res = await fetch(`/api/chat/call?roomId=${encodeURIComponent(id)}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.callStatus === 'calling' && data.callInitiatedBy !== currentUserId && !callAcceptedRef.current) {
          setCallInitiator(data.callInitiatedBy);
          setIncomingCallVisible(true);
          setCallStatus('calling');
        }
      } catch (error) {
        console.error('Call poll error:', error);
      }
    };

    const interval = setInterval(pollCalls, 1000);
    return () => clearInterval(interval);
  }, [isVideo, id, currentUserId]);

  const publishPeerId = async (peerId: string) => {
    if (!id || !currentUserId) {
      return;
    }

    try {
      await fetch('/api/chat/peer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: id, senderId: currentUserId, peerId }),
      });
    } catch (error) {
      console.error('Peer publish error:', error);
    }
  };

  const fetchRemotePeer = useCallback(async () => {
    if (!id || !currentUserId || !myPeerId) {
      return;
    }

    try {
      const res = await fetch(`/api/chat/peer?roomId=${encodeURIComponent(id)}`);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      const peerIds = data.peerIds || [];
      const remoteId = peerIds.find((item: any) => item.senderId !== currentUserId)?.peerId || null;

      if (remoteId && peerRef.current && streamRef.current && !hasCalledRef.current && callAcceptedRef.current) {
        hasCalledRef.current = true;
        const call = peerRef.current.call(remoteId, streamRef.current);
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setPeerConnected(true);
        });
      }
    } catch (error) {
      console.error('Peer fetch error:', error);
    }
  }, [id, currentUserId, myPeerId]);

  useEffect(() => {
    if (!isVideo || !myPeerId || !callAcceptedRef.current) {
      return;
    }

    const interval = setInterval(fetchRemotePeer, 2000);
    return () => clearInterval(interval);
  }, [isVideo, fetchRemotePeer, myPeerId]);

  const handlePermissionsComplete = async (permissions: {
    camera: boolean;
    location: string | null;
  }) => {
    if (permissions.camera) {
      if (permissions.location) {
        setUserLocation(permissions.location);
        window.localStorage.setItem('userLocation', permissions.location);
      }
      setShowPermissions(false);
      await initializeVideoCall();
    }
  };

  const initializeVideoCall = useCallback(async () => {
    if (!currentUserId) {
      setChatError('Unable to start video call without a valid user identifier.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !videoOff,
        audio: !muted,
      });

      streamRef.current = stream;

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      // Initiate call notification
      if (id) {
        try {
          await fetch('/api/chat/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: id, action: 'initiate', userId: currentUserId }),
          });
          setCallStatus('calling');
        } catch (err) {
          console.error('Call initiation error:', err);
        }
      }

      const peerId = `peer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      peerRef.current = new Peer(peerId, {
        host: '0.peerjs.com',
        secure: true,
        port: 443,
        path: '/',
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peerRef.current.on('open', async (idValue) => {
        console.log('My peer ID is:', idValue);
        setMyPeerId(idValue);
        await publishPeerId(idValue);
      });

      peerRef.current.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setPeerConnected(true);
        });
      });

      peerRef.current.on('error', (error) => {
        console.error('PeerJS error:', error);
        setChatError('Video call setup failed. Please try again.');
      });
    } catch (error) {
      console.error('Error initializing video call:', error);
      setChatError('Unable to start video call. Please allow camera access and try again.');
      setShowPermissions(false);
      setIsVideo(false);
    }
  }, [videoOff, muted, currentUserId, id]);

  const handleCallAccept = async () => {
    callAcceptedRef.current = true;
    setIncomingCallVisible(false);

    if (id && currentUserId) {
      try {
        await fetch('/api/chat/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: id, action: 'accept', userId: currentUserId }),
        });
        setCallStatus('active');
      } catch (err) {
        console.error('Call accept error:', err);
      }
    }

    await fetchRemotePeer();
  };

  const handleCallDecline = async () => {
    setIncomingCallVisible(false);

    if (id && currentUserId) {
      try {
        await fetch('/api/chat/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: id, action: 'decline', userId: currentUserId }),
        });
        setCallStatus('idle');
      } catch (err) {
        console.error('Call decline error:', err);
      }
    }

    setIsVideo(false);
  };

  const stopVideoCall = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    hasCalledRef.current = false;
    callAcceptedRef.current = false;
    setPeerConnected(false);
    setCallStatus('idle');
  }, []);

  useEffect(() => {
    const controlVideo = async () => {
      if (isVideo) {
        setShowPermissions(true);
      } else {
        stopVideoCall();
      }
    };

    controlVideo();
  }, [isVideo, stopVideoCall]);

  const sendMessage = async () => {
    const message = newMessage.trim();
    if (!message || !id || !currentUserId) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        text: message,
        sender: 'me',
        timestamp: new Date(),
      },
    ]);

    setNewMessage('');

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: id, senderId: currentUserId, content: message }),
      });
    } catch (error) {
      console.error('Send message error:', error);
      setChatError('Unable to send message. Please try again.');
    }
  };

  const handleReport = () => {
    alert('User reported');
  };

  const handleNext = () => {
    router.push('/matching');
  };

  const handleEnd = () => {
    router.push('/lobby');
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-slate-900">
      <PermissionsPopup isOpen={showPermissions} onComplete={handlePermissionsComplete} />
      <IncomingCallPopup
        isOpen={incomingCallVisible}
        callerName="Stranger"
        onAccept={handleCallAccept}
        onDecline={handleCallDecline}
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-4 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Match Room</p>
              <h1 className="text-2xl font-semibold">Chat & Video</h1>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">Room ID: {id}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Mode: {isVideo ? 'Video call' : 'Text chat'}</span>
              {callStatus !== 'idle' && (
                <span className={`rounded-full px-3 py-1 text-white ${callStatus === 'calling' ? 'bg-yellow-500' : callStatus === 'active' ? 'bg-green-500' : 'bg-slate-500'}`}>
                  {callStatus === 'calling' ? 'Calling...' : callStatus === 'active' ? 'Connected' : 'Declined'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[30px] bg-black/90 p-4 text-white shadow-lg">
            {isVideo ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-3xl bg-slate-950">
                  <video
                    ref={myVideoRef}
                    autoPlay
                    muted
                    className="h-72 w-full object-cover md:h-full"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm">
                    My camera
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-3xl bg-slate-950">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    className="h-72 w-full object-cover md:h-full"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm">
                    Connected: {peerConnected ? 'Yes' : 'Waiting'}
                  </div>
                  {!peerConnected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-center text-slate-200">
                      <div>
                        <p className="text-lg font-medium">{callStatus === 'calling' ? 'Calling...' : 'Waiting for your match'}</p>
                        <p className="mt-2 text-sm text-slate-300">Keep this page open while the other person joins.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-white/20 bg-white/5 p-8 text-center text-slate-200">
                <div>
                  <p className="text-xl font-semibold">Text chat mode</p>
                  <p className="mt-3 text-sm text-slate-300">Tap the button below to switch to video.</p>
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                onClick={() => setIsVideo(!isVideo)}
                className="rounded-3xl bg-white/10 px-4 py-4 text-left transition hover:bg-white/20"
              >
                <div className="text-2xl">{isVideo ? '💬' : '📹'}</div>
                <p className="mt-2 text-sm font-medium">{isVideo ? 'Stop Video' : 'Start Video'}</p>
              </button>
              <button
                onClick={handleNext}
                className="rounded-3xl bg-white/10 px-4 py-4 text-left transition hover:bg-white/20"
              >
                <div className="text-2xl">⏭️</div>
                <p className="mt-2 text-sm font-medium">Skip</p>
              </button>
              <button
                onClick={handleReport}
                className="rounded-3xl bg-white/10 px-4 py-4 text-left transition hover:bg-white/20"
              >
                <div className="text-2xl">🚨</div>
                <p className="mt-2 text-sm font-medium">Report</p>
              </button>
              <button
                onClick={handleEnd}
                className="rounded-3xl bg-white/10 px-4 py-4 text-left transition hover:bg-white/20"
              >
                <div className="text-2xl">❌</div>
                <p className="mt-2 text-sm font-medium">Leave</p>
              </button>
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Live conversation</p>
                <h2 className="text-lg font-semibold">Messages</h2>
              </div>
              <div className="text-sm text-slate-400">{roomConnected ? 'Connected' : 'Loading...'}</div>
            </div>

            <div className="min-h-[330px] space-y-3 overflow-y-auto rounded-[24px] border border-slate-200/70 bg-slate-50 p-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400">
                  <p className="text-base">No messages yet.</p>
                  <p className="text-sm">Use the input below to send your first message.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm ${msg.sender === 'me' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
                      <p>{msg.text}</p>
                      <p className="mt-2 text-[11px] text-slate-500">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500"
                disabled={!roomConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!roomConnected || !newMessage.trim()}
                className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
            {chatError && <p className="mt-3 text-sm text-red-600">{chatError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}