/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import axios from 'axios';
import * as https from 'https';
import { devLog } from './utils';

export const get = (url: string, parameters: any, access_token: string | null): Promise<any | null> => {
  let fullUrl = url;
  if (parameters != null && Object.keys(parameters).length > 0) {
    fullUrl = fullUrl + '?' + objToQueryString(parameters);
  }
  devLog('fullUrl: ' + fullUrl);
  devLog('jwtToken ' + access_token);
  let headers = {};
  if (access_token) {
    headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + access_token,
    };
  } else {
    headers = {
      'Content-Type': 'application/json',
    };
  }
  return axios({
    url: fullUrl,
    method: 'GET',
    timeout: 3000,
    responseType: 'json',
    headers: headers,
    // httpsAgent: new https.Agent({
    //     rejectUnauthorized: false,
    // }),
  })
    .then((res) => {
      // devLog('GET: '+ url + '\n' + JSON.stringify(res.data));
      return res.data;
    })
    .catch((err) => devLog(err));
};

export const post = (url: string, params: any, access_token: string | null = null) => {
  let headers = {};
  const body = JSON.stringify(params);
  devLog('Posting: ' + url + '\n' + body);
  if (access_token) {
    headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + access_token,
    };
  } else {
    headers = {
      'Content-Type': 'application/json',
    };
  }

  return axios({
    url: url,
    method: 'POST',
    headers: headers,
    data: body,
    responseType: 'json',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  })
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

function objToQueryString(obj: { [x: string]: string | number | boolean }) {
  const keyValuePairs = [];
  for (const key in obj) {
    keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return keyValuePairs.join('&');
}
