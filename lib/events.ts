// Event management utilities and types

export interface EventFormData {
  title: string;
  description: string;
  content?: any[];
  eventType: EventType;
  format: EventFormat;
  startDateTime: string;
  endDateTime: string;
  timezone?: string;
  location?: EventLocation;
  capacity?: number;
  registrationDeadline?: string;
  speakers?: string[];
  tags?: string[];
  image?: any;
  price?: EventPrice;
  requirements?: string[];
}

export interface EventLocation {
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  virtualLink?: string;
  accessInstructions?: string;
}

export interface EventPrice {
  isFree: boolean;
  amount?: number;
  currency?: string;
}

export type EventType = 
  | "networking"
  | "demo-day"
  | "workshop"
  | "panel"
  | "pitch"
  | "meetup"
  | "conference"
  | "social"
  | "other";

export type EventFormat = "in-person" | "virtual" | "hybrid";

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export type RSVPStatus = "going" | "maybe" | "not-going" | "waitlisted";

export interface EventSummary {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  eventType: EventType;
  format: EventFormat;
  startDateTime: string;
  endDateTime: string;
  timezone?: string;
  location?: EventLocation;
  capacity?: number;
  image?: any;
  price?: EventPrice;
  featured: boolean;
  organizer: {
    _id: string;
    userId: string;
    role: string;
  };
  attendeeCount: number;
  waitlistCount?: number;
}

export interface EventDetails extends EventSummary {
  content?: any[];
  registrationDeadline?: string;
  speakers?: Array<{
    _id: string;
    userId: string;
    role: string;
    bio?: string;
    company?: string;
    position?: string;
    socialLinks?: any;
  }>;
  tags?: string[];
  requirements?: string[];
  status: EventStatus;
  createdAt: string;
  updatedAt?: string;
  maybeCount?: number;
  attendees?: Array<{
    _id: string;
    attendee: {
      _id: string;
      userId: string;
      role: string;
      company?: string;
      position?: string;
    };
    registeredAt: string;
  }>;
}

export interface RSVPData {
  _id: string;
  status: RSVPStatus;
  registeredAt: string;
  updatedAt?: string;
  notes?: string;
  dietaryRestrictions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UserEventRSVP {
  _id: string;
  status: RSVPStatus;
  registeredAt: string;
  event: {
    _id: string;
    title: string;
    slug: { current: string };
    eventType: EventType;
    format: EventFormat;
    startDateTime: string;
    endDateTime: string;
    location?: EventLocation;
    image?: any;
    status: EventStatus;
  };
}

// Utility functions
export function formatEventDate(dateString: string, timezone?: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  };

  if (timezone) {
    options.timeZone = timezone;
  }

  return date.toLocaleDateString('en-US', options);
}

export function formatEventTime(startDate: string, endDate: string, timezone?: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  };

  if (timezone) {
    timeOptions.timeZone = timezone;
  }

  const startTime = start.toLocaleTimeString('en-US', timeOptions);
  const endTime = end.toLocaleTimeString('en-US', timeOptions);

  return `${startTime} - ${endTime}`;
}

export function getEventStatus(event: EventSummary): {
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  label: string;
  color: string;
} {
  const now = new Date();
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  if (now < startDate) {
    return {
      status: 'upcoming',
      label: 'Upcoming',
      color: 'blue',
    };
  } else if (now >= startDate && now <= endDate) {
    return {
      status: 'ongoing',
      label: 'Live Now',
      color: 'green',
    };
  } else {
    return {
      status: 'past',
      label: 'Past Event',
      color: 'gray',
    };
  }
}

export function canRegisterForEvent(event: EventSummary): {
  canRegister: boolean;
  reason?: string;
} {
  const now = new Date();
  const startDate = new Date(event.startDateTime);
  const registrationDeadline = event.registrationDeadline 
    ? new Date(event.registrationDeadline) 
    : startDate;

  if (now >= startDate) {
    return {
      canRegister: false,
      reason: 'Event has already started',
    };
  }

  if (now >= registrationDeadline) {
    return {
      canRegister: false,
      reason: 'Registration deadline has passed',
    };
  }

  if (event.capacity && event.attendeeCount >= event.capacity) {
    return {
      canRegister: true, // Can still register for waitlist
      reason: 'Event is full - you will be added to waitlist',
    };
  }

  return {
    canRegister: true,
  };
}

export function getEventTypeLabel(eventType: EventType): string {
  const labels: Record<EventType, string> = {
    'networking': 'Networking',
    'demo-day': 'Demo Day',
    'workshop': 'Workshop',
    'panel': 'Panel Discussion',
    'pitch': 'Pitch Competition',
    'meetup': 'Meetup',
    'conference': 'Conference',
    'social': 'Social Event',
    'other': 'Other',
  };

  return labels[eventType] || eventType;
}

export function getEventFormatLabel(format: EventFormat): string {
  const labels: Record<EventFormat, string> = {
    'in-person': 'In-Person',
    'virtual': 'Virtual',
    'hybrid': 'Hybrid',
  };

  return labels[format] || format;
}

export function validateEventData(data: Partial<EventFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Event title is required');
  }

  if (!data.description?.trim()) {
    errors.push('Event description is required');
  }

  if (!data.eventType) {
    errors.push('Event type is required');
  }

  if (!data.format) {
    errors.push('Event format is required');
  }

  if (!data.startDateTime) {
    errors.push('Start date and time is required');
  }

  if (!data.endDateTime) {
    errors.push('End date and time is required');
  }

  if (data.startDateTime && data.endDateTime) {
    const startDate = new Date(data.startDateTime);
    const endDate = new Date(data.endDateTime);

    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }

    if (startDate < new Date()) {
      errors.push('Event cannot be scheduled in the past');
    }
  }

  if (data.capacity && data.capacity < 1) {
    errors.push('Event capacity must be at least 1');
  }

  if (data.format === 'virtual' && !data.location?.virtualLink) {
    errors.push('Virtual events require a meeting link');
  }

  if (data.format === 'in-person' && !data.location?.venue) {
    errors.push('In-person events require a venue');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
