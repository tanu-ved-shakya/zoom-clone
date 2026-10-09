'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import QuickActions from '@/components/Dashboard/QuickActions';
import SettingsModal from '@/components/Modals/SettingsModal';
import NotificationsModal from '@/components/Modals/NotificationsModal';
import AuthModal from '@/components/Modals/AuthModal';
import UpcomingMeetings from '@/components/Dashboard/UpcomingMeetings';
import RecentMeetings from '@/components/Dashboard/RecentMeetings';
import NewMeetingModal from '@/components/Modals/NewMeetingModal';
import JoinMeetingModal from '@/components/Modals/JoinMeetingModal';
import ScheduleMeetingModal from '@/components/Modals/ScheduleMeetingModal';
import { User, Meeting, fetchCurrentUser, fetchMeetings } from '@/lib/api';
import { Video, Calendar, Clock, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const loadData = async () => {
    try {
      // Load persisted user if present
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('current_user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
      // Fetch fresh data
      const [u, allMeetings] = await Promise.all([
        fetchCurrentUser(),
        fetchMeetings(),
      ]);
      // Use API user if not already set from storage
      if (!sessionStorage.getItem('current_user')) {
        setUser(u);
      }
      const upcoming = allMeetings.filter(
        (m) => m.status === 'scheduled' || m.status === 'live'
      );
      const recent = allMeetings.filter(
        (m) => m.status === 'ended' || m.status === 'cancelled'
      );
      setUpcomingMeetings(upcoming);
      setRecentMeetings(recent);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartDirect = (code: string) => {
    router.push(`/meeting/${code}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-gray-900 flex flex-col font-sans">
      <Navbar
        user={user}
        onOpenNewMeeting={() => setIsNewModalOpen(true)}
        onOpenJoinMeeting={() => setIsJoinModalOpen(true)}
        onOpenSchedule={() => setIsScheduleModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0E71EB] via-[#1B84FF] to-[#3BA0FF] rounded-3xl p-8 text-white shadow-xl shadow-blue-500/10 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Zoom Workplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Good morning, {user?.display_name || 'Alex Morgan'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-blue-50/90 leading-relaxed">
              Connect effortlessly with your teams, launch high-definition video rooms, or organize upcoming collaboration sessions with ease.
            </p>
          </div>
          
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <Video className="w-64 h-64" />
          </div>
        </div>

        {/* 3 Action Cards Grid */}
        <QuickActions
          onNewMeeting={() => setIsNewModalOpen(true)}
          onJoinMeeting={() => setIsJoinModalOpen(true)}
          onScheduleMeeting={() => setIsScheduleModalOpen(true)}
        />

        {/* Dashboard Sections: Upcoming & Concluded */}
        <div className="mt-8 space-y-6">
          <UpcomingMeetings
            meetings={upcomingMeetings}
            onStartMeeting={handleStartDirect}
          />
          <RecentMeetings meetings={recentMeetings} />
        </div>
      </main>

      {/* Interactive Modals */}
      <NewMeetingModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
      <JoinMeetingModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduled={(newMeeting) => {
          setUpcomingMeetings((prev) => [newMeeting, ...prev]);
        }}
      />
    </div>
  );
}