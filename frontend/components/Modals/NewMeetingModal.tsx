'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Video, Shield, Loader2 } from 'lucide-react';
import { createInstantMeeting } from '@/lib/api';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewMeetingModal({ isOpen, onClose }: NewMeetingModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [useVideo, setUseVideo] = useState(true);
  const [usePersonalId, setUsePersonalId] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const meeting = await createInstantMeeting(
        title || "Alex Morgan's Personal Meeting Room",
        'Instant Meeting created via Zoom Workplace'
      );
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start instant meeting');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center">
              <Video className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Start New Meeting</h3>
              <p className="text-xs text-gray-400">Launch instant collaboration room</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Meeting Topic (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quick Sync with Team"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0E71EB] focus:border-transparent text-sm"
            />
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useVideo}
                onChange={(e) => setUseVideo(e.target.checked)}
                className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Start with video on</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={usePersonalId}
                onChange={(e) => setUsePersonalId(e.target.checked)}
                className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Generate fresh Meeting ID</span>
            </label>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl flex items-start space-x-2.5 text-xs text-blue-800">
            <Shield className="w-4 h-4 text-[#0E71EB] flex-shrink-0 mt-0.5" />
            <span>
              Your meeting will be secured with host management controls, live participant monitoring, and instant invite link creation.
            </span>
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
                  <span>Launching...</span>
                </>
              ) : (
                <span>Start Meeting</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}