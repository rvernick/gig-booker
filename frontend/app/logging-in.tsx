import { devLog, ensureString, fetchUser, sleep } from '@/common/utils';
import { useSession } from '@/common/ctx';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from "@/components/ui/text";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spinner } from '@/components/ui/spinner';
import { User } from '@/models/User';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from "@/components/ui/heading";
import { postError } from '@/common/errors';

/**
 * This component will help find the right landing page after the user logs in.
 * Initially, it checks to see if the user has configured their account.
 * Later, it should assist with deep linking and navigation.
 * @returns
 */
export default function LoggingIn() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [redirecting, setRedirecting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const { data, error, isFetching, isError } = useQuery({
    queryKey: ['loginConfirmation'],
    queryFn: async () => queryUser(),
    initialData: null,
    refetchInterval: 10*1000,
    refetchIntervalInBackground: false,
  });

  const queryUser = async (): Promise<User | null> => {
    devLog(`queryUser fetch ${attempts} `, session?.jwt_token);
    setAttempts(attempts + 1);
    if (session && session.username) {
      devLog('queryUser fetch', session.jwt_token);
      return fetchUser(session, ensureString(session.username), true);
    }
    return Promise.resolve(null);
  }

  const seemsStuck = async () => {
    try {
      if (!isFetching) {
        queryClient.refetchQueries({ queryKey: ['loginConfirmation'] });
        if (isError || attempts > 4) {
          router.replace('/sign-out')
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching login confirmation:', error);
      router.replace('/sign-out')
    }
  }

  const routeToNextAppropriatePage = async (passedInUser: User) => {
    if (redirecting) {
      return;
    }
    let user = passedInUser;
    try {
      if (!user || !user.username) {
        if (attempts <= 10) {
          devLog('attempts: ', attempts);
          setAttempts(attempts + 1);
          return;
        } else {
          router.replace('/sign-out')
          return;
        }
      }

      setRedirecting(true);
      if (!user.email) {
        console.log('redirecting to sign-up');
        router.replace('/(secure)/(onboarding)/email');
        return;
      }
      if (!user.emailVerified) {
        router.replace('/(secure)/(onboarding)/emailVerify');
        return;
      }
      if (!user.homeLocation) {
        console.log('redirecting to address');
        router.replace('/(secure)/(onboarding)/address');
        return;
      }
      if (!user.firstName || !user.lastName || !user.mobile) {
        console.log('redirecting to name and phone');
        router.replace('/(secure)/(onboarding)/name-and-phone');
        return;
      }
      // if (!user.agreedToTermsAndConditions) {
      //   console.log('redirecting to terms and conditions');
      //   router.replace('/(onboarding)/termsAndConditions');
      //   return;
      // }
      // if (user.isAdmin) {
      //   console.log('redirecting to admin home');
      //   router.replace('/(secure)/(home)/(admin)/users')
      // } else if (user.isRunner) {
      console.log('redirecting to home ');
      router.replace('/(secure)/(home)/(help-requests)/requests');
    } catch (error) {
      console.log('Error during login: ', error);
      setAttempts(attempts + 1);
    } finally {
      setRedirecting(false);
    };
  };

  useEffect(() => {
    if (data) {
      routeToNextAppropriatePage(data);
    }
  }, [data]);

  useEffect(() => {
    if (!isFetching) {
      queryClient.refetchQueries({ queryKey: ['loginConfirmation'] });
    }
  }, [session]);

  useEffect(() => {
    try {
      if (attempts > 10) {
        setAttempts(0);
        session.signOut();
        console.log('Redirecting to sign-out due to too many attempts');
        router.replace('/(sign-in-sign-up)/(sign-in)/sign-in-with-email');
      }
      devLog(`LoggingIn useEffect isError: ${isError} isFetching: ${isFetching} data: ${JSON.stringify(data)}`);
      if (isError) {
        console.error('Error fetching login confirmation:', error);
        postError(ensureString(session?.username), error?.name, error?.message, error?.stack, 'queryUser', JSON.stringify(session), 'logging-in');
      }
    } catch (error) {
      router.replace('/(sign-in-sign-up)/(sign-in)/sign-in-with-email');
    }
  }, [session, isError]);

  return (
    <SafeAreaView>
      {isFetching && <Spinner size="large" />}
      {session && <Heading>Welcome, {session.username}</Heading>}
      {isFetching && <Heading>Fetching User information</Heading>}
      {isError && <Text>Error fetching user information: {error.message}</Text> }
      <Text>Setting Up</Text>
      {!isFetching && !isError ? (
        <Button action="primary" onPress={seemsStuck}>
          <ButtonText>Seems Stuck</ButtonText>
        </Button>
      ) : null}
    </SafeAreaView>
  );
};