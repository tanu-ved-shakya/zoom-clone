import React, { Suspense } from 'react';
import MeetingRoom from '@/components/Meeting/MeetingRoom';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function MeetingContainer({ params }: PageProps) {
  const resolvedParams = await params;
  return <MeetingRoom meetingId={resolvedParams.id} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center font-sans">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#0E71EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-gray-300">Entering Zoom Room...</p>
          </div>
        </div>
      }
    >
      <MeetingContainer params={params} />
    </Suspense>
  );
}