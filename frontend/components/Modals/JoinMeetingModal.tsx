'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, ShieldCheck, Loader2 } from 'lucide-react';
import { fetchMeeting, joinMeeting } from '@/lib/api';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeetingId?: string;
}

export default function JoinMeetingModal({
  isOpen,
  onClose,
  defaultMeetingId = '',
}: JoinMeetingModalProps) {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState(defaultMeetingId);
  const [displayName, setDisplayName] = useState('Alex Morgan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Extract ID if user pasted full URL
    let identifier = meetingInput.trim();
    if (identifier.includes('/meeting/')) {
      identifier = identifier.split('/meeting/')[1].split('?')[0].split('/')[0];
    } else if (identifier.includes('?token=')) {
      identifier = identifier.split('?token=')[1];
    }

    if (!identifier) {
      setError('Please provide a valid Meeting ID or link.');
      return;
    }
    if (!displayName.trim()) {
      setError('Please provide your name.');
      return;
    }

    setLoading(true);
    try {
      // Validate meeting existence
      const meeting = await fetchMeeting(identifier);
      if (meeting.status === 'ended') {
        throw new Error('This meeting has ended.');
      }
      
      // Register participant join
      await joinMeeting(meeting.meeting_code, displayName);

      // Store display name in session storage for meeting room use
      sessionStorage.setItem('zoom_display_name', displayName);
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err: any) {
      setError(err.message || 'Meeting not found or unable to join.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0E71EB] text-white flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Join a Meeting</h3>
              <p className="text-xs text-gray-400">Connect to an active room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Meeting ID or Personal Link Name
            </label>
            <input
              type="text"
              required
              value={meetingInput}
              onChange={(e) => setMeetingInput(e.target.value)}
              placeholder="e.g. 492 8172 9104 or paste invite link"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-sm font-mono tracking-wide"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Your Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-sm"
            />
          </div>

          <div className="pt-2 space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Remember my name for future meetings</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Do not connect to audio</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Turn off my video</span>
            </label>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl flex items-center space-x-2.5 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>End-to-end encrypted connection managed by host</span>
          </div>

          <div className="pt-3 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0E71EB] hover:bg-[#005CE6] text-white font-bold text-sm transition shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Join</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}