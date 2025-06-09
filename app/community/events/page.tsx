import { Suspense } from 'react';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import CommunityLayout from '@/components/community/CommunityLayout';
import EventsList from '@/components/community/EventsList';

export default function CommunityEventsPage() {
  return (
    <CommunityLayout
      title="Community Events"
      description="Discover and join startup events in your area"
      actions={
        <Link
          href="/community/events/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Event</span>
        </Link>
      }
    >
      <Suspense fallback={<div>Loading events...</div>}>
        <EventsList showFilters={true} />
      </Suspense>
    </CommunityLayout>
  );
}
