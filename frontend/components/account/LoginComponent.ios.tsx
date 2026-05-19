import React, { useEffect, useState } from "react";
import { login, remind, isMobile, loginWithVerifyCode, forget, devLog, fetchGoogleIOSClientId, remember } from '@/common/utils';
import { baseUrl, post } from "../../common/http-utils";
import { router } from "expo-router";
import * as LocalAuthentication from 'expo-local-authentication';
import { useSession } from "@/common/ctx";
import { useQuery } from "@tanstack/react-query";
import { BaseScrollLayout } from "@/components/layouts/base-scroll-layout";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HStack } from "@/components/ui/hstack";
import { Link, LinkText } from "@/components/ui/link";
import { useToast } from "@/components/ui/toast";
import { FACE_ID_PASSWORD, FACE_ID_USERNAME, GOOGLE_USER_ID } from "@/common/constants";
import { GoogleSignin, GoogleSigninButton, SignInResponse, statusCodes } from '@react-native-google-signin/google-signin';

export const LoginComponent = () => {
  const session = useSession();
  let maxAttempts = 120;

  const [devFastLogin, setDevFastLogin] = useState(true);
  const [useFaceRecognition, setUseFaceRecognition] = useState(isMobile());
  const [canUseFaceId, setCanUseFaceId] = useState(false);
  const [verifyCodes, setVerifyCodes] = useState<string[]>([]);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [attemptingFaceIdLogin, setAttemptingFaceIdLogin] = useState(false);

  const { data: googleIOSClientId } = useQuery({
    queryKey: ['googleIOSClientId'],
    queryFn: () => fetchGoogleIOSClientId(),
    initialData: null,
  });

  const { data: loggedInWithVerifyCode, isFetching: helpFetching, error: helpError} = useQuery({
      queryKey: ['loginWithVerifyCode'],
      queryFn: () => attemptLoginUsingVerifyCodes(),
      initialData: false,
      refetchInterval: 1000,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
      refetchOnMount: 'always',
    })

  const attemptLoginUsing = (username: string, pass: string) => {
    const loginAttempt = login(username, pass, session);
    processLoginAttempt(loginAttempt, [FACE_ID_USERNAME, FACE_ID_PASSWORD]);
  }

  const processLoginAttempt = (attempt: Promise<string | undefined>, savedCodes: string[]) => {
    attempt
      .then(msg => {
        devLog('loginAttempt: ' + msg);
        if (msg) {
          turnOffFaceRecognition();
          savedCodes.forEach(code => {forget(code)});
        } else {
          console.log('attemptLogin successful');
          setVerifyCodes([]);
          goToHomeIfHasJWT(true);
        }
      })
      .catch(error => {
        console.log('Failed to log in ' + error.message);
        turnOffFaceRecognition();
      });
  }

  const attemptLoginUsingVerifyCode = (code: string) => {
    devLog('Logging in... ' + verifyAttempts + ' ' + code);
    const loginAttempt = loginWithVerifyCode(code, session);
    processLoginAttempt(loginAttempt, []);
  }

  const attemptLoginUsingVerifyCodes = () => {
    if (verifyAttempts > maxAttempts) return false;
    setVerifyAttempts(verifyAttempts + 1);
    verifyCodes.forEach((code: string) => { attemptLoginUsingVerifyCode(code) });
    return false;
  }

  const turnOffFaceRecognition = () => {
    setUseFaceRecognition(false);
  }

  const isLoggedIn = () => {
    return session.jwt_token && session.jwt_token.length > 0;
  }

  const attemptLoginViaDeviceId = async () => {
    const lastUser = await remind(FACE_ID_USERNAME);
    const lastPass = await remind(FACE_ID_PASSWORD);
    if (lastUser && lastPass) {
      await attemptLoginUsing(lastUser, lastPass);
    } else {
      turnOffFaceRecognition();
    }
  }

  const isFaceIdPossible = async (): Promise<boolean> => {
    if (!isMobile()) {
      return false;
    }
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    const hasBiometrics = await LocalAuthentication.isEnrolledAsync();

    return hasHardware
      && hasBiometrics
      && types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      && await hasFaceIdLoginData()
  }

  const hasFaceIdLoginData = async (): Promise<boolean> => {
    return await hasGoogleLoginData() || await hasEmailLoginData();
  }

  const hasGoogleLoginData = async (): Promise<boolean> => {
    const googleId = await remind(GOOGLE_USER_ID);
    if (!googleId) return false;
    return  googleId.length > 0;
  }

  const hasEmailLoginData = async (): Promise<boolean> => {
    const lastUser =  await remind(FACE_ID_USERNAME);
    const lastPass = await remind(FACE_ID_PASSWORD);

    return (lastUser.length > 0 && lastPass.length > 0);
  }

  const confirmUseFaceRecognition = async () => {
    if (!isMobile()) {
      setUseFaceRecognition(false);
      setCanUseFaceId(false);
      return false;
    }
    if (await isFaceIdPossible()) {
      setCanUseFaceId(true);
      return true;
    } else {
      setUseFaceRecognition(false);
      setCanUseFaceId(false);
      return false;
    }
  }

  const loginWithFaceRecognition = async () => {
    try {
      const attemptingFaceIdLoginAlready = attemptingFaceIdLogin;
      setAttemptingFaceIdLogin(true);
      if (isLoggedIn() || attemptingFaceIdLoginAlready) return;

      const confirm = await isFaceIdPossible();
      if (confirm) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Scan your face to log in',
          cancelLabel: 'Cancel',
        });
        if (result.success) {
          devLog('Face ID login successful');
          attemptLoginViaDeviceId();
        } else {
          devLog('Face ID login failed');
          turnOffFaceRecognition();
        }
      }
    } catch (error) {
      console.log('Failed to authenticate with face ID:'+ error);
    } finally {
      setAttemptingFaceIdLogin(false);
    }
  }

  const loginWithGoogleToken = async (googleResponse: SignInResponse): Promise<string | undefined> => {
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
      if (response.ok) {
        const result = await response.json();
        if (result.token && result.username) {
          session.signIn(result.token, result.username);
          remember(GOOGLE_USER_ID, googleId)
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

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      devLog('Google Sign-In success:', userInfo);
      if (userInfo.data && userInfo.data.idToken) {
        const loginAttempt = loginWithGoogleToken(userInfo);
        processLoginAttempt(loginAttempt, []);
      } else {
        devLog('Google sign-in failed');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === statusCodes.IN_PROGRESS) {
        // user cancelled the login flow
        devLog('Google sign-in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        devLog('Google sign-in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        devLog('Google Play Services not available', error.message);
        // play services not available or outdated
      } else {
        // some other error happened
        console.error(error);
      }
    }
  };

  const verifyGoogleId = async (): Promise<boolean> => {
    const googleId = await remind(GOOGLE_USER_ID);
    if (!googleId || googleId.length === 0) return false;

    const currentUser = GoogleSignin.getCurrentUser();
    if (!currentUser) return Promise.resolve(false);
    return currentUser?.user?.id === googleId;
  }

  const prepareFaceRecognition = async () => {
    if (useFaceRecognition) {
      loginWithFaceRecognition();
    }
    if (!canUseFaceId || !useFaceRecognition) {
      confirmUseFaceRecognition();
    }
  }

  const goToLoginWithEmail = () => {
    router.replace('/(sign-in-sign-up)/(sign-in)/sign-in-with-email');
  }

    const goToHomeIfHasJWT = (force: boolean = false) => {
      if (isLoggedIn()) {
        router.replace({
          pathname: '/logging-in',
          params: { jwt_token: session.jwt_token },
        });
      } else if (force) {
        router.replace('/logging-in');
      } else {
        console.log('No JWT token found, redirecting to home');
      }
    }

  useEffect(() => {
    if (googleIOSClientId) {
      GoogleSignin.configure({
        iosClientId: googleIOSClientId,
        // scopes: ['profile', 'email', 'gmail.readonly'],
      });
      if (devFastLogin) {
        devLog('Dev fast login enabled');
        setDevFastLogin(false);
      }
    }
  }, [googleIOSClientId]);

  useEffect(() => {
    if (!canUseFaceId) {
      confirmUseFaceRecognition();
    }
    goToHomeIfHasJWT();
  });

  useEffect(() => {
    prepareFaceRecognition();
  }, [useFaceRecognition, canUseFaceId]);

  if (useFaceRecognition && canUseFaceId) {
    return (
      <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md"></VStack>
      </BaseScrollLayout>
      // <Surface>
      //   <Text>Face Recognition</Text>
      // </Surface>
    );
  }
  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <VStack>
            <Heading className="md:text-center" size="3xl">
              Log in
            </Heading>
            <Text>Login to Gig Booker</Text>
          </VStack>
        </VStack>
      <VStack className="w-full">
        <VStack className="w-full my-7 " space="lg">
          {canUseFaceId ? (
            <Link onPress={() => loginWithFaceRecognition()}>
              <LinkText
                className="self-center font-medium text-primary-700 group-hover/link:text-primary-600  group-hover/pressed:text-primary-700"
                size="md"
              >
                [ Use Face ID ]
              </LinkText>
            </Link>)
            : null }
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={signInWithGoogle}
          />
          {/* <Pressable className="md:items-center" onPress={loginWithStrava}>
            <Image
              source={ require("../../assets/images/btn_strava_connectwith_orange.png")}
              className="w-[196px] h-[48px]"
              alt="Connect with Strava"
            />
          </Pressable> */}
        </VStack>

        <HStack className="self-center" space="sm">
          <Link onPress={goToLoginWithEmail}>
            <LinkText
              className="font-medium text-primary-700 group-hover/link:text-primary-600  group-hover/pressed:text-primary-700"
              size="md"
            >
              Login with email
            </LinkText>
          </Link>
        </HStack>
      </VStack>
    </VStack>
    </BaseScrollLayout>
  );
}
