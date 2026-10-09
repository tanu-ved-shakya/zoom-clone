'use client';

import React from 'react';
import { Video, Plus, Calendar } from 'lucide-react';

interface QuickActionsProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;

}

export default function QuickActions({
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-6">
      {/* 1. New Meeting Card (Zoom Orange) */}
      <button
        onClick={onNewMeeting}
        className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 text-center hover:border-orange-300"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#FF7426] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
          <Video className="w-8 h-8 fill-white" />
        </div>
        <span className="mt-4 font-semibold text-gray-900 text-base">New Meeting</span>
        <span className="text-xs text-gray-400 mt-1">Start instant room</span>
      </button>

      {/* 2. Join Meeting Card (Zoom Blue) */}
      <button
        onClick={onJoinMeeting}
        className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 text-center hover:border-blue-300"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#0E71EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
          <Plus className="w-9 h-9 stroke-[2.5]" />
        </div>
        <span className="mt-4 font-semibold text-gray-900 text-base">Join Meeting</span>
        <span className="text-xs text-gray-400 mt-1">Via ID or link</span>
      </button>

      {/* 3. Schedule Meeting Card (Zoom Blue) */}
      <button
        onClick={onScheduleMeeting}
        className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 text-center hover:border-blue-300"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#0E71EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
          <Calendar className="w-8 h-8" />
        </div>
        <span className="mt-4 font-semibold text-gray-900 text-base">Schedule</span>
        <span className="text-xs text-gray-400 mt-1">Plan future session</span>
      </button>


    </div>
  );
}