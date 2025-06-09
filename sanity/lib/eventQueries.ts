import { defineQuery } from "next-sanity";

// Get all published events with basic info
export const EVENTS_QUERY = defineQuery(`
  *[_type == "event" && status == "published"] | order(startDateTime asc) {
    _id,
    title,
    slug,
    description,
    eventType,
    format,
    startDateTime,
    endDateTime,
    timezone,
    location,
    capacity,
    image,
    price,
    featured,
    organizer->{
      _id,
      userId,
      role
    },
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"]),
    "waitlistCount": count(*[_type == "eventRsvp" && references(^._id) && status == "waitlisted"])
  }
`);

// Get featured events for homepage
export const FEATURED_EVENTS_QUERY = defineQuery(`
  *[_type == "event" && status == "published" && featured == true] | order(startDateTime asc) [0...6] {
    _id,
    title,
    slug,
    description,
    eventType,
    format,
    startDateTime,
    endDateTime,
    location,
    image,
    organizer->{
      _id,
      userId,
      role
    },
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
  }
`);

// Get upcoming events
export const UPCOMING_EVENTS_QUERY = defineQuery(`
  *[_type == "event" && status == "published" && startDateTime > now()] | order(startDateTime asc) {
    _id,
    title,
    slug,
    description,
    eventType,
    format,
    startDateTime,
    endDateTime,
    timezone,
    location,
    capacity,
    image,
    price,
    organizer->{
      _id,
      userId,
      role
    },
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"]),
    "waitlistCount": count(*[_type == "eventRsvp" && references(^._id) && status == "waitlisted"])
  }
`);

// Get single event by slug with full details
export const EVENT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    content,
    eventType,
    format,
    startDateTime,
    endDateTime,
    timezone,
    location,
    capacity,
    registrationDeadline,
    image,
    price,
    requirements,
    tags,
    status,
    featured,
    createdAt,
    updatedAt,
    organizer->{
      _id,
      userId,
      role,
      bio,
      company,
      position,
      socialLinks
    },
    speakers[]->{
      _id,
      userId,
      role,
      bio,
      company,
      position,
      socialLinks
    },
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"]),
    "maybeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "maybe"]),
    "waitlistCount": count(*[_type == "eventRsvp" && references(^._id) && status == "waitlisted"]),
    "attendees": *[_type == "eventRsvp" && references(^._id) && status == "going"] {
      _id,
      attendee->{
        _id,
        userId,
        role,
        company,
        position
      },
      registeredAt
    } | order(registeredAt desc)
  }
`);

// Get events by organizer
export const EVENTS_BY_ORGANIZER_QUERY = defineQuery(`
  *[_type == "event" && organizer._ref == $organizerId] | order(startDateTime desc) {
    _id,
    title,
    slug,
    description,
    eventType,
    format,
    startDateTime,
    endDateTime,
    status,
    image,
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
  }
`);

// Get user's RSVPs
export const USER_RSVPS_QUERY = defineQuery(`
  *[_type == "eventRsvp" && attendee._ref == $userId] | order(registeredAt desc) {
    _id,
    status,
    registeredAt,
    attendedEvent,
    event->{
      _id,
      title,
      slug,
      eventType,
      format,
      startDateTime,
      endDateTime,
      location,
      image,
      status
    }
  }
`);

// Get RSVP for specific user and event
export const USER_EVENT_RSVP_QUERY = defineQuery(`
  *[_type == "eventRsvp" && attendee._ref == $userId && event._ref == $eventId][0] {
    _id,
    status,
    registeredAt,
    updatedAt,
    notes,
    dietaryRestrictions,
    emergencyContact
  }
`);

// Get event attendees (for organizers)
export const EVENT_ATTENDEES_QUERY = defineQuery(`
  *[_type == "eventRsvp" && event._ref == $eventId] | order(registeredAt desc) {
    _id,
    status,
    registeredAt,
    attendedEvent,
    checkInTime,
    notes,
    dietaryRestrictions,
    emergencyContact,
    attendee->{
      _id,
      userId,
      role,
      bio,
      company,
      position,
      location,
      socialLinks,
      preferences
    }
  }
`);

// Search events
export const SEARCH_EVENTS_QUERY = defineQuery(`
  *[_type == "event" && status == "published" && (
    title match $searchTerm + "*" ||
    description match $searchTerm + "*" ||
    eventType match $searchTerm + "*" ||
    $searchTerm in tags[]
  )] | order(startDateTime asc) {
    _id,
    title,
    slug,
    description,
    eventType,
    format,
    startDateTime,
    endDateTime,
    location,
    image,
    tags,
    organizer->{
      _id,
      userId,
      role
    },
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
  }
`);

// Get events by type
export const EVENTS_BY_TYPE_QUERY = defineQuery(`
  *[_type == "event" && status == "published" && eventType == $eventType] | order(startDateTime asc) {
    _id,
    title,
    slug,
    description,
    eventType,
    format,
    startDateTime,
    endDateTime,
    location,
    image,
    organizer->{
      _id,
      userId,
      role
    },
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
  }
`);

// Get events by format (in-person, virtual, hybrid)
export const EVENTS_BY_FORMAT_QUERY = defineQuery(`
  *[_type == "event" && status == "published" && format == $format] | order(startDateTime asc) {
    _id,
    title,
    slug,
    description,
    eventType,
    format,
    startDateTime,
    endDateTime,
    location,
    image,
    organizer->{
      _id,
      userId,
      role
    },
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
  }
`);

// Get past events for analytics
export const PAST_EVENTS_QUERY = defineQuery(`
  *[_type == "event" && status == "completed" && endDateTime < now()] | order(endDateTime desc) {
    _id,
    title,
    slug,
    eventType,
    format,
    startDateTime,
    endDateTime,
    capacity,
    organizer->{
      _id,
      userId,
      role
    },
    "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"]),
    "actualAttendeeCount": count(*[_type == "eventRsvp" && references(^._id) && attendedEvent == true]),
    "averageRating": math::avg(*[_type == "eventRsvp" && references(^._id) && defined(feedback.rating)].feedback.rating)
  }
`);
