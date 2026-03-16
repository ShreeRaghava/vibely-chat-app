"use client";

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Peer from 'peerjs';

export default function ChatRoom() {
  const params = useParams();
  const id = params?.id as string;
  const [messages, setMessages] = useState<Array<{text: string, sender: 'me' | 'them', timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [connected, setConnected] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const router = useRouter();

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      // Ensure socket server is initialized on the server side
      await fetch('/api/socket');

      // Initialize Socket.IO
      socketRef.current = io();

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        socketRef.current?.emit('join-room', id, 'user-' + Date.now());
      });

      socketRef.current.on('receive-message', (data: { message: string; senderId: string; timestamp: Date }) => {
        setMessages((prev) => [
          ...prev,
          {
            text: data.message,
            sender: 'them',
            timestamp: new Date(data.timestamp),
          },
        ]);
      });

      socketRef.current.on('user-connected', (userId: string) => {
        console.log('User connected:', userId);
      });

      socketRef.current.on('user-disconnected', (userId: string) => {
        console.log('User disconnected:', userId);
      });
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (isVideo) {
      initializeVideoCall();
    } else {
      stopVideoCall();
    }
  }, [isVideo]);

  const initializeVideoCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !videoOff,
        audio: !muted
      });

      streamRef.current = stream;

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      // Initialize PeerJS
      const myPeerId = 'user-' + Date.now();
      peerRef.current = new Peer(myPeerId);

      peerRef.current.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        setPeerConnected(true);
      });

      peerRef.current.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      });

      // For demo purposes, we'll simulate connecting to another peer
      // In a real app, you'd get the other peer's ID from the server
      setTimeout(() => {
        if (peerRef.current) {
          const fakePeerId = 'user-' + (Date.now() - 1000);
          const call = peerRef.current!.call(fakePeerId, stream);
          if (call) {
            call.on('stream', (remoteStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
              }
            });
          }
        }
      }, 2000);

    } catch (error) {
      console.error('Error initializing video call:', error);
    }
  };

  const stopVideoCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setPeerConnected(false);
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const messageData = {
        message: newMessage,
        senderId: 'me',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, {
        text: newMessage,
        sender: 'me',
        timestamp: new Date()
      }]);

      socketRef.current.emit('send-message', newMessage);
      setNewMessage('');
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
              disabled={!connected}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!connected || !newMessage.trim()}
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