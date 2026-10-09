'use client';

import React from 'react';
import { History, Users, Clock, CheckCircle2 } from 'lucide-react';
import { Meeting } from '@/lib/api';

interface RecentMeetingsProps {
  meetings: Meeting[];
}

export default function RecentMeetings({ meetings }: RecentMeetingsProps) {
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Past';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Meetings</h2>
            <p className="text-xs text-gray-500">History and recordings of concluded sessions</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {meetings.length} Concluded
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {meetings.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No past meetings recorded yet.
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-5 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{meeting.title}</h4>
                  <span className="inline-flex items-center text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-gray-400 mr-1" /> Ended
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {formatTime(meeting.ended_at || meeting.scheduled_start)}
                  </span>
                  <span className="font-mono">ID: {meeting.meeting_code}</span>
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    {meeting.participants?.length || 1} attended
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  {meeting.duration_minutes}m duration
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}