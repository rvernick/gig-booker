import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useSession } from "@/common/ctx";
import { BaseScrollLayout } from "@/components/layouts/base-scroll-layout";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Link, LinkText } from "@/components/ui/link";
import { devLog } from "@/common/utils";
import { GoogleLogin, GoogleOAuthProvider, useGoogleOneTapLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { loginWithGoogleToken } from "./google-login";
import { SignInResponse } from "@react-native-google-signin/google-signin";

export const LoginComponent = () => {
  const session = useSession();
  const [loaded, setLoaded] = useState(false);

  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';

  const goToLoginWithEmail = () => {
    router.replace('/(sign-in-sign-up)/(sign-in)/sign-in-with-email');
  }

  useEffect(() => {
    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://accounts.google.com/gsi/client';
    scriptTag.async = true;
    scriptTag.onload = () => {
      setLoaded(true);
    };
    scriptTag.onerror = () => {
      console.error('Failed to load Google script');
    };

    document.body.appendChild(scriptTag);
  }, []);

  const ensureSignInResponse = (rawCredentials: string): SignInResponse => {
    devLog('rawCreds: ', rawCredentials);
    const decoded = jwtDecode(rawCredentials);
    devLog('decoded: ', decoded);
    const credentials = decoded as any;
    const result: SignInResponse = {
      type: 'success',
      data: {
        user: {
          id: credentials.sub,
          name: credentials.name,
          email: credentials.email,
          photo: credentials.picture,
          familyName: credentials.family_name,
          givenName: credentials.given_name,
        },
        scopes: [],
        idToken: rawCredentials,
        serverAuthCode: null
      },
    };

    return result;
  }

  const processCredentialResponse = async (creds: any) => {
    const params = { credentials: creds.credential }
    devLog('getting user info with: ', params);
    const decoded = jwtDecode(creds.credential);
    devLog("Logged in user:", decoded);
    const success = loginWithGoogleToken(session, ensureSignInResponse(creds.credential));
    devLog(success)
    processLoginAttempt(success);
  }

  const processLoginAttempt = (attempt: Promise<string | undefined>) => {
    attempt
      .then(msg => {
        devLog('loginAttempt: ' + msg);
        if (!msg || msg === 'success') {
          console.log('attemptLogin successful');
          router.replace('/logging-in');
        }
      })
      .catch(error => {
        console.log('Failed to log in ' + error.message);
      });
  }

  function GoogleLoginComponent() {
    useGoogleOneTapLogin({
      onSuccess: credentialResponse => {
        processCredentialResponse(credentialResponse);
        console.log('One Tap Login ', credentialResponse);
      },
      onError: () => {
        console.log('Login Failed');
      },
    });

    return (
      <GoogleLogin
        onSuccess={credentialResponse => {
          processCredentialResponse(credentialResponse);
          console.log(credentialResponse);
        }}
        onError={() => {
          console.log('Login Failed');
      }}/>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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
          {loaded && googleClientId ? (
            <GoogleLoginComponent/>
            ) :
            <Text>Not ready yet loaded: {loaded ? 'true' : 'false'} </Text>
          }
          <Text>Button End</Text>
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
    </GoogleOAuthProvider>
  );
}
