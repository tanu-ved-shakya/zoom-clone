export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface User {
  id: number;
  email: string;
  display_name: string;
  avatar_url?: string;
  timezone: string;
  created_at: string;
}

export interface Participant {
  id: number;
  meeting_id: number;
  user_id?: number | null;
  display_name: string;
  role: 'host' | 'participant';
  status: 'joined' | 'left' | 'removed';
  is_muted: number;
  is_video_on: number;
  joined_at: string;
  left_at?: string | null;
}

export interface Meeting {
  id: number;
  meeting_code: string;
  invite_token: string;
  host_id: number;
  title: string;
  description?: string;
  type: 'instant' | 'scheduled';
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduled_start?: string;
  duration_minutes: number;
  timezone: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  host?: User;
  participants: Participant[];
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/users/me`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function fetchMeetings(status?: string, type?: string): Promise<Meeting[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (type) params.append('type', type);
  const url = `${API_BASE_URL}/api/meetings/${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch meetings');
  return res.json();
}

export async function createInstantMeeting(title?: string, description?: string): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/instant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error('Failed to create instant meeting');
  return res.json();
}

export async function createScheduledMeeting(payload: {
  title: string;
  description?: string;
  scheduled_start: string;
  duration_minutes?: number;
  timezone?: string;
}): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to schedule meeting');
  return res.json();
}

export async function fetchMeeting(identifier: string): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${identifier}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Meeting not found');
  return res.json();
}

export async function joinMeeting(identifier: string, displayName: string, userId?: number): Promise<Participant> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${identifier}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: displayName, user_id: userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to join meeting' }));
    throw new Error(err.detail || 'Failed to join meeting');
  }
  return res.json();
}

export async function leaveMeeting(identifier: string, displayName: string): Promise<Participant> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${identifier}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: displayName }),
  });
  if (!res.ok) throw new Error('Failed to leave meeting');
  return res.json();
}

export async function startMeeting(identifier: string): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${identifier}/start`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to start meeting');
  return res.json();
}

export async function endMeeting(identifier: string): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${identifier}/end`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to end meeting');
  return res.json();
}

export async function toggleParticipantMute(participantId: number): Promise<Participant> {
  const res = await fetch(`${API_BASE_URL}/api/participants/${participantId}/mute`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to toggle mute');
  return res.json();
}

export async function toggleParticipantVideo(participantId: number): Promise<Participant> {
  const res = await fetch(`${API_BASE_URL}/api/participants/${participantId}/video`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to toggle video');
  return res.json();
}

export async function muteAllParticipants(meetingId: number): Promise<{ message: string; count: number }> {
  const res = await fetch(`${API_BASE_URL}/api/participants/meeting/${meetingId}/mute-all`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to mute all');
  return res.json();
}

export async function removeParticipant(participantId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/participants/${participantId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove participant');
  return res.json();
}