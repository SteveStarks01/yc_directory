'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  ClockIcon,
  SearchIcon,
  FilterIcon,
  StarIcon
} from 'lucide-react';
import { EventSummary, formatEventDate, formatEventTime, getEventStatus } from '@/lib/events';

interface EventsListProps {
  initialEvents?: EventSummary[];
  showFilters?: boolean;
  limit?: number;
}

export default function EventsList({ 
  initialEvents = [], 
  showFilters = true, 
  limit 
}: EventsListProps) {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventSummary[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, selectedType, selectedFormat, showFeatured, limit]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType) params.append('type', selectedType);
      if (selectedFormat) params.append('format', selectedFormat);
      if (showFeatured) params.append('featured', 'true');
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events || []);
      } else {
        console.error('Error fetching events:', data.error);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not-going') => {
    if (!session) {
      alert('Please sign in to RSVP to events');
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'RSVP updated successfully!');
        fetchEvents(); // Refresh events to update attendee counts
      } else {
        alert(data.error || 'Failed to update RSVP');
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP');
    }
  };

  const eventTypes = [
    { value: '', label: 'All Types' },
    { value: 'networking', label: 'Networking' },
    { value: 'demo-day', label: 'Demo Day' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'panel', label: 'Panel Discussion' },
    { value: 'pitch', label: 'Pitch Competition' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'conference', label: 'Conference' },
    { value: 'social', label: 'Social' },
  ];

  const eventFormats = [
    { value: '', label: 'All Formats' },
    { value: 'in-person', label: 'In-Person' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {eventFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showFeatured}
                  onChange={(e) => setShowFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const eventStatus = getEventStatus(event);
            
            return (
              <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Event Image */}
                <div className="relative h-48 bg-gray-100">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <CalendarIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {event.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <StarIcon className="w-3 h-3" />
                        <span>Featured</span>
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      eventStatus.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      eventStatus.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {eventStatus.label}
                    </span>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>{formatEventDate(event.startDateTime, event.timezone)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{formatEventTime(event.startDateTime, event.endDateTime, event.timezone)}</span>
                    </div>

                    {event.location?.venue && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        <span className="truncate">{event.location.venue}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <UsersIcon className="w-4 h-4 mr-2" />
                      <span>
                        {event.attendeeCount} attending
                        {event.capacity && ` / ${event.capacity} capacity`}
                      </span>
                    </div>
                  </div>

                  {/* Event Type and Format */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {event.eventType}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {event.format}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/events/${event.slug.current}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Details
                    </Link>

                    {session && eventStatus.status === 'upcoming' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRSVP(event._id, 'going')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          RSVP
                        </button>
                        <button
                          onClick={() => handleRSVP(event._id, 'maybe')}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-yellow-700 transition-colors"
                        >
                          Maybe
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedType || selectedFormat 
              ? 'Try adjusting your search or filters'
              : 'No events have been created yet'
            }
          </p>
          {session && (
            <Link
              href="/events/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Event
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
