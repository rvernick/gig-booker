import { GOOGLE_USER_ID } from "@/common/constants";
import { post } from "@/common/http-utils";
import { devLog, remember } from "@/common/utils";
import { SignInResponse } from "@react-native-google-signin/google-signin";

export const loginWithGoogleToken = async (session: any, googleResponse: SignInResponse): Promise<string | undefined> => {
    devLog('Google login attempt...', googleResponse);
    const googleId = googleResponse?.data?.user.id;
    if (!googleId) return 'Login failed: No google id in response';
    try {
      const payload = {
        id: googleId,
        name: googleResponse?.data?.user.name,
        email: googleResponse?.data?.user.email,
        photo: googleResponse?.data?.user.photo,
        family_name: googleResponse?.data?.user.familyName,
        given_name: googleResponse?.data?.user.givenName,
        scopes: googleResponse?.data?.scopes,
        id_token: googleResponse?.data?.idToken,
      }
      const response = await post('/auth/google', payload, null);
      devLog('loginWithGoogleToken response: ', response);
      if (response.ok) {
        const result = await response.json();
        devLog('resopnse json: ', result);
        if (result.access_token && result.user) {
          session.signIn(result.access_token, result.user.username);
          remember(GOOGLE_USER_ID, googleId);
          return undefined; // success
        }
        return 'Login failed: No token in response.';
      } else {
        const result = await response.json();
        return result.message || 'Login failed.';
      }
    } catch (e: any) {
      console.error('Google login error:', e);
      return 'An unexpected error occurred during login.';
    }
  };
