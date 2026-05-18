import { Platform } from "react-native";
import { devLog } from "./utils";

export const baseUrl = () => {
  let defaultBase = 'http://10.0.2.2:4000';  // Android emulator
  defaultBase = 'https://cup-of-sugar-be.onrender.com';
  if (Platform.OS === 'web') {
    defaultBase = 'http://localhost:4000';
  }
  if (process.env.NODE_ENV === 'production') {
    defaultBase = 'https://cup-of-sugar-be.onrender.com';
  }

  defaultBase = 'http://localhost:4000';

  const result = process.env.BASE_URL || defaultBase;
  return ensureNoSlash(result);
}

export const getInternal = async (url: string, parameters: any, jwtToken: string | null): Promise<any> => {
  const fullUrl = baseUrl() + url;
  return get(fullUrl, parameters, jwtToken);
};

export const get = (url: string, parameters: any, access_token: string | null): Promise<any> => {
  let fullUrl = url
  if (parameters != null && Object.keys(parameters).length > 0) {
    fullUrl = fullUrl + '?' + objToQueryString(parameters);
  }
  let headers = {};
  if (access_token!= null) {
    headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ access_token,
    }
  } else {
    headers = {
      'Content-Type': 'application/json',
    }
  }
  // devLog('jwtToken ' + access_token);
  return fetch(fullUrl, {
    method: 'GET',
    headers: headers,
  })
  .then((res) => res.json())
  .catch((err) => console.log('get error', err));
};

function ensureNoSlash(path: string) {
  return path.endsWith('/')? path.slice(0, -1) : path;
}

function objToQueryString(obj: { [x: string]: string | number | boolean; }) {
  const keyValuePairs = [];
  for (const key in obj) {
    keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return keyValuePairs.join('&');
}

export const post = (endpoint: string, body: object, jwtToken: string | null) => {
  return postExternal(baseUrl(), endpoint, body, jwtToken);
};

export const postInternal = (endpoint: string, body: object, jwtToken: string | null) => {
  return postExternal(baseUrl(), endpoint, body, jwtToken);
};

export const postForm = (endpoint: string, args: FormData, jwtToken: string | null): Promise<Response> => {
  const url = baseUrl() + endpoint;
  let headers = {};
  if (jwtToken) {
    devLog('jwtToken'+ jwtToken);
    headers = {
      // 'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ jwtToken,
    }
  }

  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: args,
  });
}

export const postExternal = async (urlBase: string, endpoint: string, args: object, jwtToken: string | null) => {
  let headers = {};
  const url = urlBase + endpoint;
  const body = JSON.stringify(args);
  // devLog('Posting: ' + url + '\n' + body);
  if (jwtToken) {
    // devLog('jwtToken'+ jwtToken);
    headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ jwtToken,
    }
  } else {
    headers = {
      'Content-Type': 'application/json',
    };
  }

  try {
    return fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });
  } catch (error) {
    console.error('Error posting to API:', error);
    throw error;
  }
}

/**
 * Strips everything but the base URL from a given URL string.
 *
 * @param {string} url - The full URL string.
 * @returns {string} The base URL.
 */
export const getBaseUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  } catch (error) {
    console.error('Invalid URL:', error);
    return '';
  }
}

export const isLoggedIn = async (session: any): Promise<boolean> => {
  if (session === null) {
      console.log('get Requests has no context: ');
      return false;
    }
    const jwtToken = await session.jwt_token;
    if (jwtToken == null) {
      console.log('get requests has no token dying: ' );
      return false;
    }
    return true;
}

