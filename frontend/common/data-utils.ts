import { getInternal, postForm, postInternal } from "./http-utils";
import { User } from "@/models/User";
import { devLog, ensureString } from "./utils";
import { Photo } from "@/models/Photo";
import { QueryClient } from "@tanstack/react-query";
import { tenMinutesInMilliseconds } from "./constants";
import { HelpRequest } from "@/models/HelpRequest";
import { HelpOffer } from "@/models/HelpOffer";
import type { Band } from "@/models/Band";
import type { Venue } from "@/models/Venue";
import type { CoSLocation } from "@/models/CoSLocation";
import type { BandMember } from "@/models/BandMember";
import type { Gig } from "@/models/Gig";
import type { RecurringGig } from "@/models/RecurringGig";
import type { FrequencyType } from "@/models/frequency-type.enum";
import type { DayOfWeek } from "@/models/day-of-week.enum";
import type { WeekOrdinal } from "@/models/week-ordinal.enum";
import type { GigTimeOfDay } from "@/models/gig-time-of-day.enum";
import type { VenueBookingInstructions } from "@/models/VenueBookingInstructions";

export const isServerHealthy = async () => {
  try {
    const response = await getInternal("/auth/healthCheck", [], "");
    devLog("isServerHealthy: ", response);
    return response.status === "Running";
  } catch (error) {
    console.log("Error checking server health: ", error);
    return false;
  }
};

export const allUsers = async (session: any, username: string): Promise<User[] | null> => {
  if (session === null) {
    devLog('get all users');
    return Promise.resolve([]);
  }
  const jwtToken = await session.jwt_token;
  if (jwtToken == null) {
    console.log('get users has no token dying: ' + username);
    return Promise.resolve([]);
  }

  try {
    const parameters = {
      username: username,
    };
    devLog('get all users ' +'username:'+ username);
    return getInternal('/user/all', parameters, jwtToken);
  } catch(e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
}

export const getPhoto = async (queryClient: QueryClient, session: any, id: number, username: string): Promise<Photo | null> => {
  const result = await queryClient.ensureQueryData({
    queryKey: ['photo', ensureString(id)],
    queryFn: () => fetchPhoto(session, id, username),
    staleTime: tenMinutesInMilliseconds
  });
  if (result) {
    return result;
  }
  return null;
}

const fetchPhoto = async (session: any, id: number, username: string): Promise<Photo | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || id <= 0) {
    console.log('get photo has no token dying: ' + username);
    return Promise.resolve(null);
  }

  try {
    const parameters = {
      username: username,
      id: id,
    };
    return getInternal('/user/photo', parameters, jwtToken);
  } catch(e: any) {
    console.log(e.message);
    return null;
  }
}

export const flagPhoto = async (session: any, id: number, reason: string): Promise<void> => {
  const jwtToken = session.jwt_token;
  const username = session.username;

  if (jwtToken == null || id <= 0) {
    return;
  }

  try {
    const parameters = {
      username: username,
      reason: reason,
      id: id,
    };
    postInternal('/user/flag-photo', parameters, jwtToken);
  } catch(e: any) {
    console.log(e.message);
    return;
  }
}

export const fetchRequests = async (session: any, username: string): Promise<HelpRequest[]> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    console.log('get photo has no token dying: ' + username);
    return Promise.resolve([]);
  }

  try {
    const parameters = {
      username: username,
    };
    const result = await getInternal('/help/requests-by', parameters, jwtToken);
    devLog('fetch requests ', result)
    return result;
  } catch(e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
}

export const fetchOffers = async (session: any, username: string): Promise<HelpOffer[]> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    console.log("get photo has no token dying: " + username);
    return Promise.resolve([]);
  }

  try {
    const parameters = {
      username: username,
    };
    const result = await getInternal("/help/offers-by", parameters, jwtToken);
    devLog("fetch offers: ", result);
    return result;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
};

export const fetchBandsByUser = async (
  session: any,
  username: string,
): Promise<Band[]> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve([]);
  }

  try {
    const parameters = { username };
    const result = await getInternal("/band/by-user", parameters, jwtToken);
    return result ?? [];
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
};

export const fetchBandById = async (
  session: any,
  username: string,
  id: number,
): Promise<Band | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || id <= 0) {
    return Promise.resolve(null);
  }

  try {
    const parameters = { username, id };
    const result = await getInternal("/band/by-id", parameters, jwtToken);
    return result ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const fetchBandMembers = async (
  session: any,
  username: string,
  bandId: number,
): Promise<BandMember[]> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || bandId <= 0) {
    return Promise.resolve([]);
  }

  try {
    const result = await getInternal("/band/members", { username, bandId }, jwtToken);
    return (result ?? []) as BandMember[];
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
};

export const addBandMember = async (
  session: any,
  username: string,
  bandId: number,
  memberUsername: string,
): Promise<void> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || bandId <= 0) {
    return;
  }

  try {
    await postInternal(
      "/band/add-member",
      { username, bandId, memberUsername: memberUsername.trim().toLowerCase() },
      jwtToken,
    );
  } catch (e: any) {
    console.log(e.message);
  }
};

export const removeBandMember = async (
  session: any,
  username: string,
  bandId: number,
  memberUsername: string,
): Promise<void> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || bandId <= 0) {
    return;
  }

  try {
    await postInternal(
      "/band/remove-member",
      { username, bandId, memberUsername: memberUsername.trim().toLowerCase() },
      jwtToken,
    );
  } catch (e: any) {
    console.log(e.message);
  }
};

export const updateBand = async (
  session: any,
  username: string,
  band: Pick<Band, "id" | "name">,
): Promise<Band | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || !band?.id) {
    return Promise.resolve(null);
  }

  try {
    const response = await postInternal(
      "/band/update",
      { username, id: band.id, name: band.name },
      jwtToken,
    );
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const createBand = async (
  session: any,
  username: string,
  name: string,
): Promise<Band | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || name.trim().length === 0) {
    return Promise.resolve(null);
  }

  try {
    const response = await postInternal(
      "/band/create",
      { username, name: name.trim() },
      jwtToken,
    );
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const upsertBand = async (
  session: any,
  username: string,
  band: {
    id?: number | null;
    name: string;
    photoId?: number | null;
    createdOn?: string;
    updatedOn?: string;
  },
): Promise<Band | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve(null);
  }
  const name = (band?.name ?? "").trim();
  if (name.length === 0) {
    return Promise.resolve(null);
  }

  try {
    const response = await postInternal(
      "/band/upsert",
      { username, id: Number(band?.id ?? 0), name },
      jwtToken,
    );
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const uploadBandPhoto = async (
  session: any,
  username: string,
  bandId: number,
  file: Blob | File | { uri: string; name: string; type?: string },
): Promise<Band> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || bandId <= 0) {
    throw new Error("Not signed in or invalid band.");
  }

  const formData = new FormData();
  formData.append("file", file as unknown as Blob);
  formData.append("username", username);
  formData.append("bandId", String(bandId));

  const response = await postForm("/band/upload-photo", formData, jwtToken);
  if (!response.ok) {
    let message = "Upload failed.";
    try {
      const body = await response.json();
      if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(", ") : String(body.message);
      }
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return response.json() as Promise<Band>;
};

export const fetchVenueById = async (
  session: any,
  username: string,
  id: number,
): Promise<Venue | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || id <= 0) {
    return Promise.resolve(null);
  }

  try {
    const result = await getInternal("/venue/by-id", { username, id }, jwtToken);
    return result ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const createVenue = async (
  session: any,
  username: string,
  args: {
    name: string | null;
    location: CoSLocation;
    website: string | null;
    bookingContact: string | null;
    size: string;
    musicTypes: string[];
  },
): Promise<Venue | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve(null);
  }
  if (!args.location) return Promise.resolve(null);

  try {
    const response = await postInternal(
      "/venue/create",
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

export const updateVenue = async (
  session: any,
  username: string,
  args: {
    id: number;
    name: string | null;
    location?: CoSLocation | null;
    website: string | null;
    bookingContact: string | null;
    size: string;
    musicTypes: string[];
  },
): Promise<Venue | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0 || !args?.id) {
    return Promise.resolve(null);
  }

  try {
    const response = await postInternal("/venue/update", { username, ...args }, jwtToken);
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const fetchGigsForUser = async (
  session: any,
  username: string,
): Promise<Gig[]> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve([]);
  }

  try {
    const result = await getInternal("/gig/upcoming", { username }, jwtToken);
    return result ?? [];
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
};

export const deleteGig = async (
  session: any,
  username: string,
  id: number,
): Promise<void> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) return;
  try {
    await postInternal("/gig/delete", { username, id }, jwtToken);
  } catch (e: any) {
    console.log(e.message);
  }
};

export const createGig = async (
  session: any,
  username: string,
  args: { bandId: number; venueId: number; date: string; startTime: string },
): Promise<Gig | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve(null);
  }

  try {
    const response = await postInternal("/gig/create", { username, ...args }, jwtToken);
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const updateGig = async (
  session: any,
  username: string,
  id: number,
  args: { bandId: number; venueId: number; date: string; startTime: string },
): Promise<Gig | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve(null);
  }

  try {
    const response = await postInternal("/gig/update", { username, id, ...args }, jwtToken);
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const fetchRecurringGigsForUser = async (
  session: any,
  username: string,
): Promise<RecurringGig[]> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve([]);
  }

  try {
    const result = await getInternal("/recurring-gig/for-user", { username }, jwtToken);
    return result ?? [];
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve([]);
  }
};

export const createRecurringGig = async (
  session: any,
  username: string,
  args: {
    bandId: number;
    venueId: number;
    frequencyType: FrequencyType;
    dayOfWeek: DayOfWeek;
    weekOrdinal?: WeekOrdinal | null;
    timeOfDay?: GigTimeOfDay;
  },
): Promise<RecurringGig | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve(null);
  }

  try {
    const response = await postInternal("/recurring-gig/create", { username, ...args }, jwtToken);
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const updateRecurringGig = async (
  session: any,
  username: string,
  id: number,
  args: {
    bandId: number;
    venueId: number;
    frequencyType: FrequencyType;
    dayOfWeek: DayOfWeek;
    weekOrdinal?: WeekOrdinal | null;
    timeOfDay?: GigTimeOfDay;
  },
): Promise<RecurringGig | null> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return Promise.resolve(null);
  }
  try {
    const response = await postInternal("/recurring-gig/update", { username, id, ...args }, jwtToken);
    const json = await response.json();
    return json ?? null;
  } catch (e: any) {
    console.log(e.message);
    return Promise.resolve(null);
  }
};

export const deleteRecurringGig = async (
  session: any,
  username: string,
  id: number,
): Promise<void> => {
  const jwtToken = session.jwt_token;
  if (jwtToken == null || jwtToken.length === 0) {
    return;
  }

  try {
    await postInternal("/recurring-gig/delete", { username, id }, jwtToken);
  } catch (e: any) {
    console.log(e.message);
  }
};
