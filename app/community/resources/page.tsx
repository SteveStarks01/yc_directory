import { Suspense } from 'react';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import CommunityLayout from '@/components/community/CommunityLayout';
import ResourcesList from '@/components/community/ResourcesList';

export default function CommunityResourcesPage() {
  return (
    <CommunityLayout
      title="Community Resources"
      description="Access startup guides, templates, and tools shared by the community"
      actions={
        <Link
          href="/community/resources/create"
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Resource</span>
        </Link>
      }
    >
      <Suspense fallback={<div>Loading resources...</div>}>
        <ResourcesList showFilters={true} />
      </Suspense>
    </CommunityLayout>
  );
}
