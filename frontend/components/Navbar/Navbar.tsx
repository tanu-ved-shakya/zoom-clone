'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Settings, Grid, Video, LogIn } from 'lucide-react';
import { User } from '@/lib/api';

interface NavbarProps {
  user?: User | null;
  onOpenNewMeeting?: () => void;
  onOpenJoinMeeting?: () => void;
  onOpenSchedule?: () => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onOpenAuth?: () => void;
}

export default function Navbar({
  user,
  onOpenNewMeeting,
  onOpenJoinMeeting,
  onOpenSchedule,
  onOpenSettings,
  onOpenNotifications,
  onOpenAuth,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-[#0E71EB] hover:opacity-90 transition">
            <div className="w-9 h-9 rounded-xl bg-[#0E71EB] flex items-center justify-center text-white shadow-sm">
              <Video className="w-5 h-5 fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#0E71EB]">zoom</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="px-3 py-2 text-sm font-semibold text-[#0E71EB] border-b-2 border-[#0E71EB] transition"
            >
              Workplace
            </Link>
            <Link 
              href="/schedule" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Schedule
            </Link>
            <Link 
              href="/join" 
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Join
            </Link>
          </nav>
        </div>

        {/* Global Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings, contacts, chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 hover:bg-gray-200/70 focus:bg-white text-sm rounded-full border border-transparent focus:border-[#0E71EB] focus:outline-none transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-2 mr-2">
            <button
              onClick={onOpenNewMeeting}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0E71EB] text-white hover:bg-[#005CE6] transition"
            >
              + New
            </button>
            <button
              onClick={onOpenJoinMeeting}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Join
            </button>
          </div>

          <button 
            onClick={onOpenSettings}
            title="Settings" 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={onOpenNotifications}
            title="Notifications" 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0E71EB] rounded-full"></span>
          </button>

          {/* User Profile & Auth Trigger */}
          <div 
            onClick={onOpenAuth}
            className="flex items-center pl-2 border-l border-gray-200 cursor-pointer group"
            title="Account & Login / Signup Settings"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#0E71EB]/20 bg-[#0E71EB] text-white flex items-center justify-center font-bold text-xs uppercase group-hover:ring-[#0E71EB] transition">
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
              ) : (
                user?.display_name?.slice(0, 2) || 'AM'
              )}
            </div>
            <div className="hidden xl:block ml-2 text-left">
              <p className="text-xs font-semibold text-gray-900 leading-tight group-hover:text-[#0E71EB] transition">
                {user?.display_name || 'Alex Morgan'}
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">Default Account</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}