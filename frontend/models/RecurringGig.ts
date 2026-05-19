import type { Band } from './Band';
import type { Venue } from './Venue';
import type { FrequencyType } from './frequency-type.enum';
import type { DayOfWeek } from './day-of-week.enum';
import type { WeekOrdinal } from './week-ordinal.enum';
import type { GigTimeOfDay } from './gig-time-of-day.enum';

export interface RecurringGig {
  id: number;
  bandId: number;
  band: Band;
  venueId: number;
  venue: Venue;
  frequencyType: FrequencyType;
  dayOfWeek: DayOfWeek;
  weekOrdinal: WeekOrdinal | null;
  timeOfDay: GigTimeOfDay;
  createdOn?: string;
  updatedOn?: string;
}
