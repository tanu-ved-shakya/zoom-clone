'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Users,
  MessageSquare,
  PhoneOff,
  Copy,
  Check,
  X,
  Send,
  UserX
} from 'lucide-react';
import {
  Meeting,
  Participant,
  fetchMeeting,
  endMeeting,
  leaveMeeting,
  toggleParticipantMute,
  muteAllParticipants,
  removeParticipant
} from '@/lib/api';

interface MeetingRoomProps {
  meetingId: string;
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myDisplayName, setMyDisplayName] = useState('Alex Morgan');
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Media Controls (Host / User)
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Sidebar Toggles
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reactions, setReactions] = useState<{ id: string; emoji: string }[]>([]);

  // In-meeting Chat State
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'Zoom System',
      text: 'Welcome to Zoom Meeting. Live audio & video channel encrypted.',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Local Video preview reference
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Poll meeting info and initialize display name
  useEffect(() => {
    const savedName = sessionStorage.getItem('zoom_display_name');
    const nameTimer = window.setTimeout(() => {
      if (savedName) {
        setMyDisplayName(savedName);
      } else {
        setShowNameModal(true);
      }
    }, 0);

    const loadData = async () => {
      try {
        const data = await fetchMeeting(meetingId);
        setMeeting(data);
        const currentName = sessionStorage.getItem('zoom_display_name') || 'Alex Morgan';
        // Filter out whoever is currently the local user (either by display name or host role)
        const others = (data.participants || []).filter(
          (p) => p.status === 'joined' && p.display_name.toLowerCase() !== currentName.toLowerCase()
        );
        setParticipants(others);
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to connect to meeting.');
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 4000);

    return () => {
      window.clearTimeout(nameTimer);
      clearInterval(interval);
    };
  }, [meetingId]);

  // Request actual camera feed if available (gracefully fallback if permission denied)
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isVideoOn && navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          mediaStreamRef.current = s;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera not available or denied; fallback avatar displayed
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn]);

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/meeting/${meeting?.meeting_code || meetingId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeaveMeeting = async () => {
    if (confirm('Are you sure you want to leave this meeting?')) {
      if (meeting) {
        try {
          const isHost = meeting.host?.display_name.toLowerCase() === myDisplayName.toLowerCase();
          if (isHost) {
            await endMeeting(meeting.meeting_code);
          } else {
            await leaveMeeting(meeting.meeting_code, myDisplayName);
          }
        } catch (e) {
          console.error('Unable to leave meeting cleanly:', e);
        }
      }
      router.push('/');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        sender: 'You',
        text: chatInput,
        time: now,
      },
    ]);
    setChatInput('');
  };

  const sendReaction = (emoji: string) => {
    const id = crypto.randomUUID();
    setReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  };

  // Host Action: Mute/Unmute individual participant
  const handleToggleMute = async (pId: number) => {
    try {
      const updated = await toggleParticipantMute(pId);
      setParticipants((prev) => prev.map((p) => (p.id === pId ? updated : p)));
    } catch (err) {
      console.error(err);
    }
  };

  // Host Action: Mute All
  const handleMuteAll = async () => {
    if (!meeting) return;
    try {
      await muteAllParticipants(meeting.id);
      setParticipants((prev) => prev.map((p) => (p.role !== 'host' ? { ...p, is_muted: 1 } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  // Host Action: Remove Participant
  const handleRemove = async (pId: number) => {
    try {
      await removeParticipant(pId);
      setParticipants((prev) => prev.filter((p) => p.id !== pId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-[#0E71EB] border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold">Connecting to Zoom Meeting...</h2>
        <p className="text-sm text-gray-400 mt-2 font-mono">Room ID: {meetingId}</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center p-6">
        <div className="bg-[#242424] p-8 rounded-2xl max-w-md w-full text-center border border-gray-800">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold mb-2">Meeting Unavailable</h2>
          <p className="text-sm text-gray-400 mb-6">{error || 'This meeting does not exist or has ended.'}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 rounded-xl bg-[#0E71EB] text-white font-semibold text-sm hover:bg-[#005CE6] transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col overflow-hidden select-none font-sans">
      {/* Top Bar Header */}
      <div className="h-12 bg-[#1A1A1A] border-b border-[#2C2C2C] px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 rounded-md text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Encrypted • Live</span>
          </div>
          <span className="text-sm font-semibold text-gray-200 truncate max-w-xs sm:max-w-md">
            {meeting.title}
          </span>
          <span className="text-xs text-gray-400 font-mono hidden sm:inline">
            ({meeting.meeting_code})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyInvite}
            className="px-3 py-1 text-xs rounded-md bg-[#2C2C2C] hover:bg-[#383838] text-gray-300 flex items-center space-x-1.5 transition"
            title="Copy Invite Link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 font-medium">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Invite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Video Arena + Slide-out Sidebars */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Reactions Display */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-3 pointer-events-none z-30">
          {reactions.map((r) => (
            <div
              key={r.id}
              className="text-4xl animate-bounce bg-black/40 backdrop-blur-md p-2 rounded-2xl shadow-xl"
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Video Grid Section */}
        <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto items-center justify-center content-center">
          {/* Tile 1: Current User (Host / Self) */}
          <div className="relative aspect-video bg-[#222222] rounded-2xl overflow-hidden border border-gray-800 shadow-xl flex items-center justify-center group">
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#0E71EB] text-white text-2xl font-bold flex items-center justify-center shadow-lg">
                  AM
                </div>
                <span className="text-xs text-gray-400 mt-2">Camera turned off</span>
              </div>
            )}

            {/* Tile Tag */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 text-white">
              {isMuted ? (
                <MicOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-green-400" />
              )}
              <span>You (Host)</span>
            </div>
          </div>

          {/* Dynamic Participant Tiles */}
          {participants.map((participant, idx) => (
              <div
                key={participant.id}
                className="relative aspect-video bg-[#222222] rounded-2xl overflow-hidden border border-gray-800 shadow-xl flex items-center justify-center group"
              >
                {/* Simulated WebRTC video stream avatar */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
                      idx % 3 === 0
                        ? 'bg-purple-600'
                        : idx % 3 === 1
                        ? 'bg-emerald-600'
                        : 'bg-amber-600'
                    }`}
                  >
                    {participant.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-400">Connected</span>
                  </div>
                </div>

                {/* Participant Overlay Tag */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 text-white">
                  {participant.is_muted ? (
                    <MicOff className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-green-400" />
                  )}
                  <span>{participant.display_name}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Sidebar: Participants List */}
        {showParticipants && (
          <aside className="w-80 bg-[#1F1F1F] border-l border-[#2E2E2E] flex flex-col z-20 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-[#2E2E2E] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#0E71EB]" />
                <h3 className="font-semibold text-sm">
                  Participants ({participants.length + 1})
                </h3>
              </div>
              <button
                onClick={() => setShowParticipants(false)}
                className="p-1 text-gray-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Host Item */}
              <div className="p-2.5 rounded-xl bg-[#2A2A2A] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#0E71EB] text-white flex items-center justify-center text-xs font-bold">
                    AM
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Alex Morgan (You)</p>
                    <p className="text-[10px] text-[#0E71EB] font-bold">Host, me</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-gray-400">
                  {isMuted ? (
                    <MicOff className="w-4 h-4 text-red-400" />
                  ) : (
                    <Mic className="w-4 h-4 text-green-400" />
                  )}
                  {isVideoOn ? (
                    <Video className="w-4 h-4 text-gray-300" />
                  ) : (
                    <VideoOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>

              {/* Other participants */}
              {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-[#252525] hover:bg-[#2A2A2A] transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold">
                        {p.display_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-200">{p.display_name}</p>
                        <p className="text-[10px] text-gray-500">Participant</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleMute(p.id)}
                        className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700"
                        title={p.is_muted ? 'Unmute' : 'Mute'}
                      >
                        {p.is_muted ? (
                          <MicOff className="w-4 h-4 text-red-400" />
                        ) : (
                          <Mic className="w-4 h-4 text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700"
                        title="Remove Participant"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Host Bulk Actions */}
            <div className="p-3 border-t border-[#2E2E2E] flex space-x-2">
              <button
                onClick={handleMuteAll}
                className="flex-1 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] text-xs font-semibold transition"
              >
                Mute All
              </button>
              <button
                onClick={handleCopyInvite}
                className="py-2 px-3 rounded-lg bg-[#0E71EB] hover:bg-[#005CE6] text-white text-xs font-semibold transition"
              >
                Invite
              </button>
            </div>
          </aside>
        )}

        {/* Sidebar: Live Chat */}
        {showChat && (
          <aside className="w-80 bg-[#1F1F1F] border-l border-[#2E2E2E] flex flex-col z-20 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-[#2E2E2E] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#0E71EB]" />
                <h3 className="font-semibold text-sm">Meeting Chat</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 text-gray-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-[#0E71EB]">{m.sender}</span>
                    <span className="text-[10px] text-gray-500">{m.time}</span>
                  </div>
                  <p className="text-xs text-gray-300 bg-[#262626] p-2.5 rounded-xl border border-gray-800">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2E2E2E] flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message everyone..."
                className="flex-1 bg-[#282828] text-xs text-white px-3 py-2 rounded-lg border border-transparent focus:border-[#0E71EB] focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#0E71EB] hover:bg-[#005CE6] text-white transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* Modern Zoom Bottom Control Bar */}
      <footer className="h-18 bg-[#181818] border-t border-[#282828] px-4 py-2 flex items-center justify-between z-30">
        {/* Left Audio & Video Controls */}
        <div className="flex items-center space-x-2">
          {/* Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition min-w-[56px] ${
              isMuted ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:bg-[#282828]'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] mt-1 font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Camera */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition min-w-[56px] ${
              !isVideoOn ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-300 hover:bg-[#282828]'
            }`}
          >
            {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            <span className="text-[10px] mt-1 font-medium">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>
        </div>

        {/* Center Main Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition min-w-[56px] relative ${
              showParticipants ? 'text-[#0E71EB] bg-blue-500/10' : 'text-gray-300 hover:bg-[#282828]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Participants</span>
            <span className="absolute top-1 right-2 text-[9px] bg-[#0E71EB] text-white px-1 rounded-full font-bold">
              {participants.length + 1}
            </span>
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition min-w-[56px] ${
              showChat ? 'text-[#0E71EB] bg-blue-500/10' : 'text-gray-300 hover:bg-[#282828]'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Chat</span>
          </button>

          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`hidden sm:flex flex-col items-center justify-center p-2 rounded-xl transition min-w-[56px] ${
              isScreenSharing ? 'text-green-500 bg-green-500/10' : 'text-gray-300 hover:bg-[#282828]'
            }`}
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Share Screen</span>
          </button>

          {/* Emoji Reactions Menu */}
          <div className="flex items-center space-x-1 bg-[#222222] px-2 py-1 rounded-xl">
            {['👏', '👍', '❤️', '🎉'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="text-base hover:scale-125 transition-transform px-1"
                title={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Right End Call Button */}
        <div>
          <button
            onClick={handleLeaveMeeting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-red-600/20"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Meeting</span>
          </button>
        </div>
      </footer>

      {/* Enter Display Name Before Joining Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1E1E1E] text-white rounded-3xl max-w-sm w-full p-6 border border-gray-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              <Video className="w-6 h-6 fill-white" />
            </div>
            <h3 className="text-lg font-bold">Enter Display Name</h3>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Please choose how you want to be identified in this meeting room.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!nameInput.trim()) return;
                setMyDisplayName(nameInput.trim());
                sessionStorage.setItem('zoom_display_name', nameInput.trim());
                setShowNameModal(false);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your display name (e.g. Alex Morgan)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white text-sm focus:outline-none focus:border-[#0E71EB]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0E71EB] hover:bg-[#005CE6] text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
              >
                Continue to Meeting
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}