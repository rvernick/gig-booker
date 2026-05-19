import { CoSLocation } from './CoSLocation';

export interface Venue {
  id: number;
  name: string | null;
  locationId: number;
  location: CoSLocation | null;
  website: string | null;
  bookingContact: string | null;
  size: string;
  musicTypes: string[];
}
