'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import { Video, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { fetchMeeting, joinMeeting } from '@/lib/api';

export default function JoinPage() {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState('');
  const [displayName, setDisplayName] = useState('Alex Morgan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let identifier = meetingInput.trim();
    if (identifier.includes('/meeting/')) {
      identifier = identifier.split('/meeting/')[1].split('?')[0].split('/')[0];
    } else if (identifier.includes('?token=')) {
      identifier = identifier.split('?token=')[1];
    }

    if (!identifier) {
      setError('Please provide a valid Meeting ID or invite URL');
      return;
    }

    setLoading(true);
    try {
      const meeting = await fetchMeeting(identifier);
      if (meeting.status === 'ended') {
        throw new Error('This meeting has already ended.');
      }
      await joinMeeting(meeting.meeting_code, displayName);
      sessionStorage.setItem('zoom_display_name', displayName);
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err: any) {
      setError(err.message || 'Meeting not found. Please double check the ID.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-[#0E71EB] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Video className="w-7 h-7 fill-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Join a Meeting</h1>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Enter your meeting ID or paste the invite link to enter the room
          </p>

          {error && (
            <div className="p-3 mb-4 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl font-medium text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Meeting ID or Personal Link
              </label>
              <input
                type="text"
                required
                value={meetingInput}
                onChange={(e) => setMeetingInput(e.target.value)}
                placeholder="e.g. 492 8172 9104"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-sm font-mono tracking-wide"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-sm"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-center space-x-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Verified and encrypted Zoom room connection</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#0E71EB] hover:bg-[#005CE6] text-white font-bold text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Joining Room...</span>
                </>
              ) : (
                <>
                  <span>Join Meeting</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}