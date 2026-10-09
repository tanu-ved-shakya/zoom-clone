'use client';

import React, { useState } from 'react';
import { X, Bell, Calendar, Video, CheckCircle, Info } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Upcoming Meeting in 15 Minutes',
      desc: 'Design System & Workplace Sync with the product team starts at 2:00 PM.',
      time: '12m ago',
      unread: true,
      icon: Calendar,
      type: 'meeting',
    },
    {
      id: 2,
      title: 'Meeting Recording Available',
      desc: 'Cloud recording for "Sprint 14 Retro & Engineering Review" is now ready to share.',
      time: '1h ago',
      unread: true,
      icon: Video,
      type: 'recording',
    },
    {
      id: 3,
      title: 'System Security Encryption Enabled',
      desc: 'Zoom Workplace cryptographic end-to-end audio/video channel active.',
      time: '3h ago',
      unread: false,
      icon: CheckCircle,
      type: 'system',
    },
    {
      id: 4,
      title: 'Welcome to Zoom Workplace',
      desc: 'You are signed in as Alex Morgan. AI Companion features are enabled on your account.',
      time: '1d ago',
      unread: false,
      icon: Info,
      type: 'welcome',
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0E71EB] flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
              <p className="text-xs text-gray-400">Activity and alerts</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold text-[#0E71EB] hover:underline"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 flex items-start space-x-3 transition ${
                  item.unread ? 'bg-blue-50/30' : 'hover:bg-gray-50/70'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === 'meeting'
                      ? 'bg-blue-100 text-[#0E71EB]'
                      : item.type === 'recording'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-[#0E71EB] ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                    {item.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}