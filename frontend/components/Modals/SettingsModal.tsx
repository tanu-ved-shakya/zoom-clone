'use client';

import React, { useState } from 'react';
import { X, Settings, Video, Mic, Bell, Shield, Monitor, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'video' | 'audio' | 'notifications'>('general');
  const [hdVideo, setHdVideo] = useState(true);
  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState('auto');
  const [autoMute, setAutoMute] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);
  const [theme, setTheme] = useState('system');
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[520px] animate-in fade-in zoom-in-95 duration-200">
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-56 bg-gray-50 border-r border-gray-100 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 px-3 py-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#0E71EB] text-white flex items-center justify-center shadow-sm">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Settings</span>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'general', label: 'General', icon: Monitor },
                { id: 'video', label: 'Video', icon: Video },
                { id: 'audio', label: 'Audio', icon: Mic },
                { id: 'notifications', label: 'Notifications', icon: Bell },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-[#0E71EB] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl text-[11px] text-[#0E71EB] flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Encrypted Settings</span>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-900 capitalize">{activeTab} Settings</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Application Appearance
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E71EB]"
                  >
                    <option value="system">Use System Default</option>
                    <option value="light">Classic Light (Workplace)</option>
                    <option value="dark">Dark Theme (Meeting Arena)</option>
                  </select>
                </div>

                <div className="pt-2 space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Start Zoom when starting system</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Automatically copy invite link once meeting starts</span>
                  </label>
                </div>
              </div>
            )}

            {/* Video Tab */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 text-xs aspect-video max-h-40">
                  <Video className="w-8 h-8 text-gray-600 mb-2" />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hdVideo}
                      onChange={(e) => setHdVideo(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable HD video streaming (720p/1080p)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mirrorVideo}
                      onChange={(e) => setMirrorVideo(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Mirror my video feed</span>
                  </label>
                </div>
              </div>
            )}

            {/* Audio Tab */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Background Noise Suppression
                  </label>
                  <select
                    value={noiseSuppression}
                    onChange={(e) => setNoiseSuppression(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E71EB]"
                  >
                    <option value="auto">Auto (Recommended)</option>
                    <option value="low">Low (Faint background music)</option>
                    <option value="medium">Medium (Computer fan/pen clicks)</option>
                    <option value="high">High (Aggressive filtering)</option>
                  </select>
                </div>

                <div className="pt-2 space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoMute}
                      onChange={(e) => setAutoMute(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Mute microphone when joining a meeting</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Press and hold Space bar to temporarily unmute</span>
                  </label>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNotifications}
                      onChange={(e) => setShowNotifications(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Display desktop banner notifications</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Play chime when meeting participants join or leave</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-[#0E71EB] focus:ring-[#0E71EB] border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Remind me 5 minutes before scheduled meetings</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#0E71EB] hover:bg-[#005CE6] text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              {savedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}