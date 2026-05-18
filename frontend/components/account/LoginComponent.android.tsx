import React, { useEffect, useState } from "react";
import { login, remind, isMobile, loginWithVerifyCode, forget, devLog } from '@/common/utils';
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
import { FACE_ID_PASSWORD, FACE_ID_USERNAME } from "@/common/constants";
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

export const LoginComponent = () => {
  const session = useSession();
  let maxAttempts = 120;

  const [devFastLogin, setDevFastLogin] = useState(true);
  const [useFaceRecognition, setUseFaceRecognition] = useState(isMobile());
  const [canUseFaceId, setCanUseFaceId] = useState(false);
  const [verifyCodes, setVerifyCodes] = useState<string[]>([]);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [attemptingFaceIdLogin, setAttemptingFaceIdLogin] = useState(false);

  const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email(),
    password: z.string().min(1, "Password is required"),
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

  type LoginSchemaType = z.infer<typeof loginSchema>;

  const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<LoginSchemaType>({
      resolver: zodResolver(loginSchema),
    });
    const toast = useToast();
    const [validated, setValidated] = useState({
      emailValid: true,
      passwordValid: true,
    });

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
          setValidated({ emailValid: true, passwordValid: false });
          savedCodes.forEach(code => {forget(code)});

          // toast.show({
          //   title: "Login Failed",
          //   description: msg,
          // });
        } else {
          console.log('attemptLogin successful');
          setVerifyCodes([]);
          goToHomeIfHasJWT(true);
        }
      })
      .catch(error => {
        console.log('Failed to log in ' + error.message);
        setValidated({ emailValid: true, passwordValid: false });
        turnOffFaceRecognition();
        // toast.show({
        //   title: "Login Error",
        //   description: "An unexpected error occurred.",
        // });
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
      && await hasFaceIdData()
  }

  const hasFaceIdData = async (): Promise<boolean> => {
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
          setValidated({ emailValid: true, passwordValid: false });
        }
      }
    } catch (error) {
      console.log('Failed to authenticate with face ID:'+ error);
    } finally {
      setAttemptingFaceIdLogin(false);
    }
  }

  const prepareFaceRecognition = async () => {
    if (useFaceRecognition) {
      loginWithFaceRecognition();
    }
    if (!canUseFaceId || !useFaceRecognition) {
      confirmUseFaceRecognition();
    }
  }

  const loginWithGoogleToken = async (idToken: string): Promise<string | undefined> => {
    try {
      const response = await post('/auth/google', { idToken }, null);
      if (response.ok) {
        const result = await response.json();
        if (result.token && result.username) {
          session.signIn(result.token, result.username);
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
      // if (userInfo.idToken) {
      //   const loginAttempt = loginWithGoogleToken(userInfo.idToken);
      //   processLoginAttempt(loginAttempt, []);
      // } else {
      //   toast.show({
      //     title: 'Google Sign-In Error',
      //     description: 'Could not get ID token from Google.',
      //   });
      // }
    } catch (error: any) {
      // if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
      //   console.error(error);
      //   toast.show({
      //     title: 'Google Sign-In Error',
      //     description: 'An unexpected error occurred.',
      //   });
      // }
    }
  };

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
    GoogleSignin.configure({
      // webClientId is required for Android Google Sign-In
      // You can get this from your Google Cloud console
      // webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    });
    if (devFastLogin) {
      devLog('Dev fast login enabled');
      setDevFastLogin(false);
      if (baseUrl().includes('localhost:')) {
        devLog('Dev fast login: using local user');
        loginSchema.parseAsync({ email: 't5@t.com', password: 'h@ppyHappy' });
      }
    }
    if (!canUseFaceId) {
      confirmUseFaceRecognition();
    }
    goToHomeIfHasJWT();
  }, []);

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
            <Text>Login to Cup of Sugar</Text>
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
        </VStack>
        <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={signInWithGoogle}
          />

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
