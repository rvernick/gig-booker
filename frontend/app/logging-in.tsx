import { confirmLogin, devLog, ensureString, fetchUser } from '@/common/utils';
import { useSession } from '@/common/ctx';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from "@/components/ui/text";
import { Spinner } from '@/components/ui/spinner';
import { User } from '@/models/User';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heading } from "@/components/ui/heading";
import { postError } from '@/common/errors';
import { fetchBandsByUser, isServerHealthy } from '@/common/data-utils';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

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
  const [serverLive, setServerLive] = useState('Server is live');
  const [loggedInState, setLoggedInState] = useState('logged-in');

  const { data, error, isFetching, isError } = useQuery({
    queryKey: ['loginConfirmation'],
    queryFn: async () => queryUser(),
    initialData: null,
    refetchInterval: 1*1000,
    refetchIntervalInBackground: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const queryUser = async (): Promise<User | null> => {
    devLog(`queryUser fetch ${attempts} `, session?.jwt_token);
    setAttempts(attempts + 1);
    if (session && session.username) {
      devLog('queryUser fetch', session.jwt_token);
      const result = await fetchUser(session, ensureString(session.username), true);
      if (result) return result;
      return Promise.resolve(null);
    }
    return Promise.resolve(null);
  }

  const checkThatServerIsLive = async () => {
    const serverIsLive = await isServerHealthy();
    if (serverIsLive) {
      devLog('server live')
      setServerLive('Server live');
    } else {
      setServerLive('Server down');
    }
  }

  const getLoggedInInfo = async (attemptCount: number) => {
    const status = await confirmLogin(session);
    if (status === 'not-logged-in') {
      setAttempts(attemptCount + 1);
    }
    setLoggedInState(status);
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
      } else {
        getLoggedInInfo(attempts);
        checkThatServerIsLive();
      }

      const bandsPromise = fetchBandsByUser(session, user.username);

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
      const bands = await bandsPromise;
      if (bands.length > 0) {
        router.replace('/(secure)/(home)/(gigs)');
      } else {
        router.replace('/(secure)/(home)/(bands)');
      }
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
        router.replace('/(sign-in-sign-up)/(sign-in)/sign-in');
      }
      devLog(`LoggingIn useEffect isError: ${isError} isFetching: ${isFetching} data: ${JSON.stringify(data)}`);
      if (isError) {
        console.error('Error fetching login confirmation:', error);
        postError(ensureString(session?.username), error?.name, error?.message, error?.stack, 'queryUser', JSON.stringify(session), 'logging-in');
      }
    } catch (error) {
      router.replace('/(sign-in-sign-up)/(sign-in)/sign-in');
    }
  }, [session, isError]);

  // return (
  //   <SafeAreaView>
  //     {isFetching && <Spinner size="large" />}
  //     {session && <Heading>Welcome, {session.username}</Heading>}
  //     {isFetching && <Heading>Fetching User information</Heading>}
  //     {isError && <Text>Error fetching user information: {error.message}</Text> }
  //     <Text>Setting Up</Text>
  //     {!isFetching && !isError ? (
  //       <Button action="primary" onPress={seemsStuck}>
  //         <ButtonText>Seems Stuck</ButtonText>
  //       </Button>
  //     ) : null}
  //   </SafeAreaView>
  // );
  return (
   <VStack className="w-full h-full">
    <Spinner size="large" />
    {/* <Image
      source={require('../assets/images/pawsitive-icon.jpg')}
      className="object-cover w-full h-1/2"
      alt="Radial Gradient"
    /> */}
    <Icon></Icon>
    <VStack className="max-w-[440px] w-full" space="md">
      <VStack className="md:items-center" space="md">
        <VStack>
          <Heading className="text-center" size="3xl">
            Gig Booker
          </Heading>
          <Text className="text-center"> </Text>
          <Card className="mb-6 p-4">
            {session && <Heading>Welcome, {session.username}</Heading>}
            <Heading>Fetching User information</Heading>
            {isError && <Text>Error fetching user information: {error.message}</Text> }
            {data ? (
              <VStack>
                <Text>{data.username}</Text>
              </VStack>
            ) : (
              <Text>User not found yet</Text>
            )}
            <Text>Setting Up</Text>
            <Text>{serverLive}</Text>
            <Text>Login state: {loggedInState}</Text>
            <Text>Redirecting: {redirecting ? 'true' : 'false'}</Text>
            {attempts > 1 && <Text>Attempt #{attempts}</Text>}
            {attempts > 4 && <Text>JWT: {session.jwt_token}</Text>}
          </Card>
        </VStack>
      </VStack>
    </VStack>
  </VStack>
  );
};