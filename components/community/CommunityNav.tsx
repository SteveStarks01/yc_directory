'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CalendarIcon, 
  FileTextIcon, 
  UsersIcon,
  PlusIcon,
  MenuIcon,
  XIcon,
  StarIcon,
  TrendingUpIcon
} from 'lucide-react';

export default function CommunityNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/community',
      icon: HomeIcon,
      description: 'Community overview and stats',
    },
    {
      name: 'Events',
      href: '/community/events',
      icon: CalendarIcon,
      description: 'Discover and join events',
    },
    {
      name: 'Resources',
      href: '/community/resources',
      icon: FileTextIcon,
      description: 'Browse startup resources',
    },
    {
      name: 'Members',
      href: '/community/members',
      icon: UsersIcon,
      description: 'Connect with the community',
    },
  ];

  const quickActions = [
    {
      name: 'Create Event',
      href: '/community/events/create',
      icon: PlusIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      permission: 'CREATE_EVENT',
    },
    {
      name: 'Add Resource',
      href: '/community/resources/create',
      icon: PlusIcon,
      color: 'bg-green-600 hover:bg-green-700',
      permission: 'CREATE_RESOURCE',
    },
  ];

  const featuredSections = [
    {
      name: 'Featured Events',
      href: '/community/events?featured=true',
      icon: StarIcon,
      count: '3',
    },
    {
      name: 'Popular Resources',
      href: '/community/resources?popular=true',
      icon: TrendingUpIcon,
      count: '12',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/community') {
      return pathname === '/community';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-lg shadow-md border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <XIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <MenuIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Community</h2>
            <p className="text-sm text-gray-600 mt-1">YC Directory</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${active 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          {session && (
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  
                  return (
                    <Link
                      key={action.name}
                      href={action.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors
                        ${action.color}
                      `}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {action.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Sections */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Featured</h3>
            <div className="space-y-2">
              {featuredSections.map((section) => {
                const Icon = section.icon;
                
                return (
                  <Link
                    key={section.name}
                    href={section.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2 text-gray-500" />
                      {section.name}
                    </div>
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {section.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Info */}
          {session && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user?.role || 'Member'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
