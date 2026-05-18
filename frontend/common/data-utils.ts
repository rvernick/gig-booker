import { getInternal, postInternal } from "./http-utils";
import { User } from "@/models/User";
import { devLog, ensureString } from "./utils";
import { Photo } from "@/models/Photo";
import { QueryClient } from "@tanstack/react-query";
import { tenMinutesInMilliseconds } from "./constants";
import { HelpRequest } from "@/models/HelpRequest";
import { HelpOffer } from "@/models/HelpOffer";

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
