import type { Band } from './Band';
import type { Venue } from './Venue';

export interface Gig {
  id: number;
  date: string;
  startTime: string;
  bandId: number;
  band: Band;
  venueId: number;
  venue: Venue;
  createdOn?: string;
  updatedOn?: string;
}
