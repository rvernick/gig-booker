import { Venue } from "@/models/Venue";
import { getInternal, postInternal } from "./http-utils";
import { CoSLocation } from "@/models/CoSLocation";
import { VenueBookingInstructions } from "@/models/VenueBookingInstructions";


export const fetchVenueBookingInstructions = async (
  session: any,
  username: string,
  venueId: number,
): Promise<VenueBookingInstructions | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || venueId <= 0) {
    return Promise.resolve(null);
  }
  try {
    const result = await getInternal(
      "/venue/booking-instructions",
      { username, venueId },
      jwtToken,
    );
    return result ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const upsertVenueBookingInstructions = async (
  session: any,
  username: string,
  args: VenueBookingInstructions,
): Promise<VenueBookingInstructions | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve(null);
  }
  try {
    const response = await postInternal(
      "/venue/booking-instructions/upsert",
      { username, ...args },
      jwtToken,
    );
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const fetchVenues = async (
  session: any,
  username: string,
): Promise<Venue[]> => {
  return fetchAllVenues(session, username);
};

export const fetchAllVenues = async (
  session: any,
  username: string,
): Promise<Venue[]> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve([]);
  }

  try {
    const result = await getInternal("/venue/all", { username }, jwtToken);
    return result ?? [];
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
};

export const fetchFavoriteVenues = async (
  session: any,
  username: string,
): Promise<Venue[]> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve([]);
  }

  try {
    const result = await getInternal(
      "/venue/favorites",
      { username },
      jwtToken,
    );
    return result ?? [];
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
};

export const addFavoriteVenue = async (
  session: any,
  username: string,
  venueId: number,
): Promise<void> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || venueId <= 0) {
    return;
  }

  try {
    await postInternal("/venue/favorite/add", { username, venueId }, jwtToken);
  } catch (e: any) {
    console.log(e.message);
  }
};

export const removeFavoriteVenue = async (
  session: any,
  username: string,
  venueId: number,
): Promise<void> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || venueId <= 0) {
    return;
  }

  try {
    await postInternal(
      "/venue/favorite/remove",
      { username, venueId },
      jwtToken,
    );
  } catch (e: any) {
    console.log(e.message);
  }
};

export const upsertVenue = async (
  session: any,
  username: string,
  args: {
    id?: number | null;
    name: string | null;
    location: CoSLocation | null;
    website: string | null;
    bookingContact: string | null;
    size: string;
    musicTypes: string[];
    createdOn?: string;
    updatedOn?: string;
  },
): Promise<Venue | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve(null);
  }

  try {
    const response = await postInternal(
      "/venue/upsert",
      { username, ...args, id: Number(args?.id ?? 0) },
      jwtToken,
    );
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};
