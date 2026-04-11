"use client";

import { motion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Peer from 'peerjs';

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
  const router = useRouter();

  const peerRef = useRef<Peer | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasCalledRef = useRef(false);

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

      if (remoteId && peerRef.current && streamRef.current && !hasCalledRef.current) {
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
    if (!isVideo || !myPeerId) {
      return;
    }

    const interval = setInterval(fetchRemotePeer, 2000);
    return () => clearInterval(interval);
  }, [isVideo, fetchRemotePeer, myPeerId]);

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

      const peerId = `peer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      peerRef.current = new Peer(peerId, {
        host: 'peerjs.com',
        secure: true,
        port: 443,
        path: '/peerjs',
      });

      peerRef.current.on('open', async (idValue) => {
        console.log('My peer ID is:', idValue);
        setMyPeerId(idValue);
        setPeerConnected(true);
        await publishPeerId(idValue);
        await fetchRemotePeer();
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
    } catch (error) {
      console.error('Error initializing video call:', error);
      setChatError('Unable to start video call. Please allow camera access and try again.');
    }
  }, [videoOff, muted, currentUserId, fetchRemotePeer]);

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
    setPeerConnected(false);
  }, []);

  useEffect(() => {
    const controlVideo = async () => {
      if (isVideo) {
        await initializeVideoCall();
      } else {
        stopVideoCall();
      }
    };

    controlVideo();
  }, [isVideo, initializeVideoCall, stopVideoCall]);

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
    // TODO: report user
    alert('User reported');
  };

  const handleNext = () => {
    router.push('/matching');
  };

  const handleEnd = () => {
    router.push('/lobby');
  };

  return (
    <div className="min-h-screen bg-nude-beige">
      <div className="flex flex-col h-screen">
        {/* Video Container */}
        <div className="flex-1 bg-black relative">
          {isVideo ? (
            <div className="h-full flex">
              {/* My Video */}
              <div className="flex-1 relative">
                <video
                  ref={myVideoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  You
                </div>
              </div>

              {/* Remote Video */}
              <div className="flex-1 relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  Stranger {peerConnected ? '🟢' : '🔴'}
                </div>
                {!peerConnected && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <p>Waiting for connection...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="w-32 h-32 bg-nude-cream rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">💬</span>
                </div>
                <p>Text Chat Mode</p>
                <p className="text-sm mt-2">Click video button to start video call</p>
              </div>
            </div>
          )}
          
          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMuted(!muted)}
              className={`p-3 rounded-full ${muted ? 'bg-red-500' : 'bg-white'}`}
            >
              {muted ? '🔇' : '🔊'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setVideoOff(!videoOff)}
              className={`p-3 rounded-full ${videoOff ? 'bg-red-500' : 'bg-white'}`}
            >
              {videoOff ? '📷' : '📹'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVideo(!isVideo)}
              className={`p-3 rounded-full ${isVideo ? 'bg-green-500' : 'bg-gray-500'}`}
            >
              {isVideo ? '📹' : '💬'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="p-3 rounded-full bg-blue-500"
            >
              ⏭️
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReport}
              className="p-3 rounded-full bg-red-500"
            >
              🚨
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEnd}
              className="p-3 rounded-full bg-gray-500"
            >
              ❌
            </motion.button>
          </div>
        </div>

        {/* Text Chat */}
        <div className="h-64 bg-white flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>💬 Start chatting!</p>
                <p className="text-sm">Messages will appear here</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`mb-3 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    msg.sender === 'me'
                      ? 'bg-black text-nude-beige'
                      : 'bg-nude-cream text-black'
                  }`}>
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Type a message..."
              disabled={!roomConnected}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!roomConnected || !newMessage.trim()}
              className="bg-black text-nude-beige px-4 py-2 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}