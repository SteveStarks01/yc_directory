'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CommunityNav from './CommunityNav';
import { BellIcon, SettingsIcon, LogOutIcon } from 'lucide-react';

interface CommunityLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export default function CommunityLayout({ 
  children, 
  title, 
  description, 
  actions 
}: CommunityLayoutProps) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <CommunityNav />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {title && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {description && (
                      <p className="text-gray-600 mt-1">{description}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {actions}
                
                {session && (
                  <>
                    {/* Notifications */}
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <BellIcon className="w-5 h-5" />
                    </button>

                    {/* Settings */}
                    <Link
                      href="/community/settings"
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <SettingsIcon className="w-5 h-5" />
                    </Link>

                    {/* User Menu */}
                    <div className="relative">
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg border border-gray-200 bg-white">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {session.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-sm font-medium text-gray-900">
                            {session.user?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.user?.role || 'Member'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!session && (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/auth/signin"
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join Community
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-6 py-8 mt-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Community</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/community" className="text-sm text-gray-600 hover:text-gray-900">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/events" className="text-sm text-gray-600 hover:text-gray-900">
                        Events
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/resources" className="text-sm text-gray-600 hover:text-gray-900">
                        Resources
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/members" className="text-sm text-gray-600 hover:text-gray-900">
                        Members
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/community/resources?type=guide" className="text-sm text-gray-600 hover:text-gray-900">
                        Startup Guides
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/resources?type=template" className="text-sm text-gray-600 hover:text-gray-900">
                        Templates
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/resources?type=tool" className="text-sm text-gray-600 hover:text-gray-900">
                        Tools
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/resources?type=course" className="text-sm text-gray-600 hover:text-gray-900">
                        Courses
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Events</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/community/events?type=networking" className="text-sm text-gray-600 hover:text-gray-900">
                        Networking
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/events?type=workshop" className="text-sm text-gray-600 hover:text-gray-900">
                        Workshops
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/events?type=demo-day" className="text-sm text-gray-600 hover:text-gray-900">
                        Demo Days
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/events?upcoming=true" className="text-sm text-gray-600 hover:text-gray-900">
                        Upcoming
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link href="/community/guidelines" className="text-sm text-gray-600 hover:text-gray-900">
                        Community Guidelines
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-600">
                  © 2024 YC Directory Community. All rights reserved.
                </p>
                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                    Terms of Service
                  </Link>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                    Privacy Policy
                  </Link>
                  <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900">
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
