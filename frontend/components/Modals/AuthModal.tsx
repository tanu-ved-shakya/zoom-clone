'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, CheckCircle2, Video } from 'lucide-react';
import { User as UserType } from '@/lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserType | null;
  onUserUpdate?: (user: UserType) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdate,
}: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState(currentUser?.email || 'alex.morgan@zoomclone.local');
  const [displayName, setDisplayName] = useState(currentUser?.display_name || 'Alex Morgan');
  const [password, setPassword] = useState('••••••••••••');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserType = {
      id: currentUser?.id || 1,
      email,
      display_name: displayName,
      timezone: currentUser?.timezone || 'America/New_York',
      created_at: currentUser?.created_at || new Date().toISOString(),
      avatar_url: currentUser?.avatar_url,
    };

    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }

    setSuccessMsg(
      isLoginMode
        ? `Logged in as ${displayName}`
        : `Account created for ${displayName}`
    );

    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0E71EB] text-white flex items-center justify-center shadow-sm">
              <Video className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {isLoginMode ? 'Sign In to Zoom' : 'Create Zoom Account'}
              </h3>
              <p className="text-xs text-gray-400">Zoom Workplace Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-3 text-xs font-bold transition text-center border-b-2 ${
              isLoginMode
                ? 'border-[#0E71EB] text-[#0E71EB] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-3 text-xs font-bold transition text-center border-b-2 ${
              !isLoginMode
                ? 'border-[#0E71EB] text-[#0E71EB] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign Up Free
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isLoginMode && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E71EB]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E71EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E71EB]"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl text-[11px] text-[#0E71EB]">
            <span>💡 <strong>Default User Active:</strong> Alex Morgan is pre-authenticated with host administrative capabilities.</span>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#0E71EB] hover:bg-[#005CE6] text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
            >
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}