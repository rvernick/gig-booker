import { baseUrl, getInternal, post } from "./http-utils";
import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/models/User";
import { ImageResult, manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { FACE_ID_PASSWORD, FACE_ID_USERNAME, LAST_LOGIN_TIME_MS, threeMB } from "./constants";
import * as ImagePicker from 'expo-image-picker';
import { identifyLogRocketMobile, identifyLogRocketWeb } from "./logrocket";

export const strippedPhone = (formattedPhone: string) => {
  if (!formattedPhone) {
    return '';
  }
  return formattedPhone.replace(/[^0-9]/g, '');
};

export const isValidPhone = (phone: string) => {
  return strippedPhone(phone).length === 10;
};

export const isMobileSize = (): boolean => {
  return isMobile() || isSmallScreen();
};

const isSmallScreen = (): boolean => {
  return window && window.innerWidth != null && window.innerWidth < 600;
}

export const isMobile = (): boolean => {
  try {
    return Platform.OS === 'android' || Platform.OS === 'ios';
  } catch(e) {
    return false;
  }
}

export const isProduction = (): boolean => {
  return isMobile() || process.env.NODE_ENV === 'production';
}

export const isDevelopment = (): boolean => {
  return baseUrl().includes('localhost') || baseUrl().includes('192.168');
}

export const devLog = (...args: any[]) => {
  // if (isDevelopment()) {
    console.log(...args);
  // }
};

export const remember = (key: string, value: string) => {
  if (isMobile()) {
    SecureStore.setItemAsync(key, value);
  } else {
    AsyncStorage.setItem(key, value);
  }
}

export const forget = (key: string) => {
  if (isMobile()) {
    SecureStore.deleteItemAsync(key);
  } else {
    AsyncStorage.removeItem(key);
  }
}

export const remind = async (key: string): Promise<string> => {
  if (isMobile()) {
    return ensureString(SecureStore.getItem(key));
  } else {
    return ensureString(await AsyncStorage.getItem(key));
  }
}

/**
 * ensures password is at least 8 characters long
 * has at least one special character
 * and at least one lower and one upper case letter
 * h@ppyHappy
 */
export const isValidPassword = (password: string) => {
  return (
    password.length >= 8 &&
    password.match(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/) !=  null
  );
}

export const isValidEmail = (email: string): boolean => {
  return (
    email.includes('@') &&
    email.includes('.') &&
    email.length > 4 &&
    email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) != null);
}

export const isValidSession = async (session: any): Promise<boolean> => {
  return await confirmLogin(session) === 'logged-in';
}

export async function confirmLogin(session: any): Promise<string> {
  if (session === null || session.jwt_token === null) {
    return '';
  }
  try {
    devLog('Confirm Login.  Checking session...');
    const result = await getInternal('/auth/check-session', {  }, session.jwt_token);
    if (result.status === 'logged-in') {
      return 'logged-in';
    } else {
      console.log('Failed to check session with get: ' + result.ok + JSON.stringify(result));
      return 'not-logged-in';
    }
  } catch (error) {
    console.log('Failed to check session: ' + error);
    return 'not-logged-in';
  }
}

export async function login(username: string, password: string, session: any): Promise<string | undefined> {
  console.log('Logging in... ' + username);

  if (username === '' || password === '') {
    console.log('Invalid username or password');
    return 'Invalid username or password';
  }

  const args = {
    username: username,
    password: password,
  };
  const response = post('/auth/login', args, null);
  return response
    .then(resp => {
      if (resp.ok) {
        devLog('resp: ' + resp);
        // devLog('setting appContext.jwtToken to:'+ resp.json())
        // devLog('body ' + resp.body);
        // devLog('json ' + resp.body);
        resp.json().then(body => {
          session.signIn(body.access_token, username);
          devLog('setting appContext.jwtToken to:' + body);
          devLog('body ' + body.access_token);
          if (isMobile()) {
            const now = new Date();
            remember(FACE_ID_USERNAME, username);
            remember(FACE_ID_PASSWORD, password);
            remember(LAST_LOGIN_TIME_MS, now.getTime().toString());
          }
          initializeLogRocket(body.user);
          console.log('setting appContext.username to:'+ username);
          return '';
        });
      } else {
        console.log('Login failed ' + resp.statusText);
        return 'Invalid username or password';
      }
    })
    .catch(error => {
      console.log('Failed to log in ' + error.message);
      return 'System error';
    });
};

export const loginWithVerifyCode = async (code: string, session: any): Promise<string | undefined> => {
  console.log('Logging in... ' + code);

  const args = {
    verifyCode: code,
  };
  const response = post('/auth/sign-in-strava-verify-code', args, null);
  return response
    .then(resp => {
      if (resp.ok) {
        devLog('resp: ' + resp);
        // devLog('setting appContext.jwtToken to:'+ resp.json())
        // devLog('body ' + resp.body);
        // devLog('json ' + resp.body);
        resp.json().then(body => {
          const user = body.user;
          session.signIn(body.access_token, user.username);
          console.log('setting appContext.jwtToken to:' + body);
          console.log('body ' + body.access_token);
          if (isMobile()) {
            const now = new Date();
            remember(LAST_LOGIN_TIME_MS, now.getTime().toString());
          }
          initializeLogRocket(user);
          console.log('setting appContext.username to:'+ user.username);
          return '';
        });
      } else {
        console.log('Login failed ' + resp.statusText);
        // forget(FACE_ID_USER_ID);
        // forget(FACE_ID_STRAVA_CODE);
        return 'Invalid username or password';
      }
    })
    .catch(error => {
      console.log('Failed to log in ' + error.message);
      return 'System error';
    });
}

const initializeLogRocket = (user: User) => {
  if (!isProduction()) {
    console.log('Not initializing LogRocket.');
    return;
  }

  console.log('Initializing LogRocket...');
  try {
    if (isMobile()) {
      identifyLogRocketMobile(user.username, user.firstName, user.lastName);
    } else {
      identifyLogRocketWeb(user.username, user.firstName, user.lastName);
    }
  } catch (error: any) {
    console.error('Failed to initialize LogRocket:', error);
  }
}

export const fetchUser = async (session: any, username: string, throwIfError: boolean = false): Promise<User | null> => {
  return fetchUserByJwtToken(session.jwt_token, username, throwIfError);
}

export const fetchUserByJwtToken = async (jwtToken: string, username: string, throwIfError: boolean = false): Promise<User | null> => {
  devLog('fetching user: ' + username, jwtToken);
  try {
    const parameters = {
      username: username,
    };
    return getInternal('/auth/user', parameters, jwtToken) as Promise<User | null>;
  } catch(e: any) {
    console.log(e.message);
    if (throwIfError) {
      throw new Error('Failed to fetch user', e);
    }
    return null;
  }
}

export const setUserPushToken = async (session: any, pushToken: string): Promise<User | null> => {
try {
    const parameters = {
      username: session.username,
      push_token: pushToken,
    };
    return post('/user/update-push-token', parameters, session.jwt_token) as Promise<any | null>;
  } catch(e: any) {
    console.log(e.message);
    return null;
  }
}

export const fetchSecrets = async (session: any): Promise<any | null> => {
  console.log('fetchSecrets jwt: ' + session.jwt_token);
  try {
    const parameters = {};
    devLog('fetching secrets ');
    return getInternal('/user/v1/system-secrets', parameters, session.jwt_token) as Promise<any | null>;
  } catch(e: any) {
    console.log(e.message);
    return null;
  }
}

export const fetchSecretsByVerify = async (verifyCode: string, target: string): Promise<any | null> => {
  try {
    const parameters = {
      verifyCode: verifyCode,
      target: target,
    };
    devLog('fetching secrets: ' + verifyCode);
    return getInternal('/user/v1/secrets', parameters, '');
  } catch(e: any) {
    console.log('error in fetchsecretsByVerify ' + e.message);
    return null;
  }
}

export const googleMapsLinkForPlace = (placeId: string): string => {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
};

export const pause = (): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, 400);
  });
}

export const sleep = (seconds: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, 1000*seconds);
  });
};

export const copy = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
}

export const invalidPasswordMessage = 'password must be at least 8 characters with a mix of special, upper and lower case'

export const ensureString = (value: string | string[] | null | undefined | number | any): string => {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  return '';
}

export const ensureNumber = (value: string | null | undefined | number | any): number => {
  if (!value || value == null) return 0;

  if (typeof value === 'number') {
    return value;
  }
  if (value == null || value === '') {
    return 0;
  }
  if (typeof value ==='string') {
    if (value.match(/^[0-9]+$/)) {
      return parseInt(value);
    }
    try {
      if (value.match(/^[-+]?[0-9]*\.?[0-9]+$/)) {
        const result = parseFloat(value);
        if (isNaN(result)) {
          return 0;
        }
        return result;
      }
    } catch (error: any) {
      return 0;
    }
  }
  return 0;
}

export const ensureDate = (value: string | Date | null | undefined | number): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  if (typeof value ==='string') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  }
  return new Date();
}

export const isoDate = (date: Date): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

export const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}/${day}/${year}`;
}

export const today = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export const preprocessFile = async (asset: ImagePicker.ImagePickerAsset) => {
  if (asset.file == null) {
    return createFileFromUri(asset.uri, asset.mimeType? asset.mimeType : null );
  }
  devLog('File uri: ', asset.uri);
  devLog('File size: ', asset.fileSize);
  if (asset.fileSize && asset.fileSize < threeMB) {
    return asset.file;
  }

  devLog('compressing');
  return createFileFromUri(asset.uri, asset.mimeType? asset.mimeType : null );
}

export const createFileFromUri = async (uri: string, mimeType: string | null, maxSize: number = threeMB): Promise<File | null> => {
  if (mimeType == null) return null;
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.split('/').pop() || 'image.jpg';

    console.log('create File from uri File size: ' + maxSize, blob.size);
    if (maxSize > 0 && blob.size > maxSize) {
      const compressionFactor = maxSize / blob.size;
      console.log('Compression factor:', compressionFactor);
      const compressedBlob = await compressImage(uri, compressionFactor)
      return createFileFromUri(compressedBlob.uri, 'image/jpeg', 0);  // sending zero for max size prevents infinite loops
    }

    if (Platform.OS === 'web') {
      // devLog('File created on web:');
      return new File([blob], filename, { type: mimeType });
    } else {
      // For React Native, create a file-like object
      // console.log('File created on ios:', blob.size);
      return {
        uri: uri,
        name: filename,
        body: blob,
        size: blob.size,
        type: mimeType,
      } as any;
    }
  } catch (error) {
    console.error('Error creating file from URI:', error);
    return null;
  }
};

const compressImage = async (uri: string, quality: number): Promise<ImageResult> => {
  const result =  await manipulateAsync(
    uri,
    [{resize: { width: 500, height: 500 }}],
    { compress: quality, format: SaveFormat.JPEG, base64: true, },
  );
  console.log('Compressed image:', result);
  return result;
}
export const usDateStringFrom = (date: Date): string => {
  devLog('usDateStringFrom:', date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const result = `${month}/${day}/${year}`;
  devLog('usDateStringFrom: ', year);
  devLog('usDateStringFrom: ', month);
  devLog('usDateStringFrom: ', day);
  devLog('usDateString: ', result);
  return result;
}

export const getDateFromString = (dateString: string): Date | null => {
  try {
    const date = new Date(Date.parse(dateString));
    if (!isNaN(date.getTime())) {
      devLog(dateString + ' parsed date:', date);
      devLog('year', date.getFullYear());
      devLog('month', date.getMonth());
      devLog('day', date.getDate());
      devLog('hours', date.getHours());

      if (date.getHours() === 0) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);
    }

    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      devLog('Parsing date from MM/DD/YYYY:', month, day, year);
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  } catch (error) {
    console.error('Error parsing date string:', error);
  }
  return null;
}

