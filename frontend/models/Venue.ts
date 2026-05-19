import type { CoSLocation } from "./CoSLocation";

export type VenueSize = "micro" | "small" | "mid-sized" | "arena" | "stadium";

export interface Venue {
  id: number;
  name: string | null;
  locationId: number;
  location: CoSLocation;
  website: string | null;
  bookingContact: string | null;
  size: VenueSize;
  musicTypes: string[];
  createdOn?: string;
  updatedOn?: string;
}

