import { post } from "./http-utils";

export const postError = async (
  username: string = '',
  code: string = '',
  message: string = '',
  stackTrace: string = '',
  call: string = '',
  payload: string = '',
  page: string= '') => {

  try {
    const body = {
      username: username,
      code: code,
      message: message,
      stackTrace: stackTrace,
      call: call,
      payload: payload,
      page: page,
    };

    const response = await post('/error/log', body, null);
    if (response.ok) {
      return;
    } else {
      const error = await response.json();
      console.log('json'+ error);
    }
  } catch (error) {
    console.error('Error when posting error:', error);
  }
};