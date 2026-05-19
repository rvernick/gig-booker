export type BookingMethodType = 'phone' | 'email' | 'web_form' | 'snail_mail';

export interface VenueBookingInstructions {
  id?: number;
  venueId: number;
  type: BookingMethodType;
  generalNotes?: string | null;
  notes?: string | null;
  bodyTemplate?: string | null;
  // phone
  phoneNumber?: string | null;
  // email
  emailAddress?: string | null;
  subjectTemplate?: string | null;
  // web_form
  url?: string | null;
  // phone + email + snail_mail
  contactName?: string | null;
  // phone
  bestTimeToCall?: string | null;
  // snail_mail
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}
