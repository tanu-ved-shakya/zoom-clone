'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Copy, Check, Play, User as UserIcon } from 'lucide-react';
import { Meeting } from '@/lib/api';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  onStartMeeting: (meetingCode: string) => void;
}

export default function UpcomingMeetings({ meetings, onStartMeeting }: UpcomingMeetingsProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    const inviteUrl = `${window.location.origin}/meeting/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMeetingDate = (dateString?: string) => {
    if (!dateString) return 'Today';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMeetingTime = (dateString?: string) => {
    if (!dateString) return 'Anytime';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E71EB] flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upcoming Meetings</h2>
            <p className="text-xs text-gray-500">Your scheduled events and team sessions</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#0E71EB]">
          {meetings.length} Scheduled
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {meetings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">No upcoming meetings</p>
            <p className="text-xs text-gray-400 mt-1">Schedule a meeting to collaborate with others.</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-5 hover:bg-gray-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gray-50 border border-gray-200/60 text-center flex-shrink-0">
                  <span className="text-[10px] uppercase font-bold text-[#0E71EB]">
                    {formatMeetingDate(meeting.scheduled_start).split(' ')[0]}
                  </span>
                  <span className="text-base font-extrabold text-gray-900 leading-none mt-0.5">
                    {formatMeetingDate(meeting.scheduled_start).split(' ')[2] || '—'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 text-base">{meeting.title}</h3>
                    {meeting.status === 'live' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-700 animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500 mt-1.5">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {formatMeetingTime(meeting.scheduled_start)} ({meeting.duration_minutes} min)
                    </span>
                    <span className="flex items-center font-mono">
                      Meeting ID: {meeting.meeting_code}
                    </span>
                    <span className="flex items-center">
                      <UserIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      Host: {meeting.host?.display_name || 'Alex Morgan'}
                    </span>
                  </div>
                  {meeting.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">
                      "{meeting.description}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleCopy(meeting.meeting_code)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center space-x-1.5 transition shadow-sm"
                  title="Copy Invitation Link"
                >
                  {copiedId === meeting.meeting_code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onStartMeeting(meeting.meeting_code)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0E71EB] hover:bg-[#005CE6] text-white flex items-center space-x-1.5 transition shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}