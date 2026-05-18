import React, { useState, useEffect } from 'react';
import { useGlobalContext } from "../../common/GlobalContext";
import OnboardingController from "./OnboardingController";
import { forget, fetchUser, devLog } from '../../common/utils';
import { router } from "expo-router";
import { useSession } from "@/common/ctx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseScrollLayout } from "../layouts/base-scroll-layout";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { blankUser } from "@/models/User";
import { Place } from 'react-native-google-places-textinput';
import { baseUrl } from "@/common/http-utils";
import { prLocationFrom } from "@/models/CoSLocation";
import { Heading } from "../ui/heading";
import { Alert, AlertIcon, AlertText } from '../ui/alert';
import { InfoIcon } from '../ui/icon';
import { PlacesTextInput } from '../common/PlacesTextInput';

export const HomeAddressComponent: React.FC = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const username = session.username ? session.username : '';
  const appContext  = useGlobalContext();
  appContext.setSession(session);
  const [isDirty, setIsDirty] = useState(false);
  const [startLocationText, setStartLocationText] = useState('');
  const [home, setHome] = useState<any | null>(null);
  const [entering, setEntering] = useState<string | null>(null);
  const [sfOnlyWarning, setSfOnlyWarning] = useState('');
  const controller = new OnboardingController(appContext);

  const { status, data, error, isFetching } = useQuery({
    queryKey: ['user', username],
    queryFn: () => fetchUser(session, username),
    initialData: blankUser,
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
  });

  const invalidateUser = () => {
    devLog('Invalidate user: ' + username);
    queryClient.removeQueries({queryKey: ['user', username]});
    forget("ff.preferences");
    setIsDirty(false);
  }

  function handleHomePlaceSelect(place: Place, sessionToken?: string | null | undefined): void {
    devLog('Place Selected: ', place);
    devLog('Session Token: ', sessionToken);
    if (place) {
      if (home && home.placeId === place.placeId) {
        console.log('Home place already selected');
        return;
      }
      devLog('Place details: ', place.details);
      setHome(prLocationFrom(place));
      setStartLocationText(place.details?.formattedAddress);
      devLog('startLocationText places: ', place.details?.displayName?.text);
      if (!place.details?.formattedAddress.includes('San Francisco')) {
        setSfOnlyWarning('Currently, we only have service in San Francisco, CA.  We will notify you when we expand to your area!');
      }
    } else {
      setHome(null);
    }
  }

  const handleHomePlaceSelectError = (error: Error) => {
    console.error(error.message);
  }

  const updateAccount = async function() {
    const response = await controller.updateHomeAddress(
      session,
      username,
      home,
      entering,
    );
    if (response === '') {
      setIsDirty(false);
      invalidateUser();
    }
    router.replace('/(secure)/(onboarding)/name-and-phone');
  };

  const userUpdated = async () => {
    if (isDirty) {
      return;
    }
    syncUser();
  }

  const syncUser = async () => {
    if (data?.homeLocation) {
      setHome(data.homeLocation);
      setStartLocationText(data.homeLocation.formattedAddress);
      setEntering(data?.household?.enteringInstructions ? data.household.enteringInstructions : null);
    } else {
      setHome(null);
      setStartLocationText('');
      setEntering('');
    }
    devLog('User ', JSON.stringify(data));
    devLog('User source: ', data?.source);
  }

  useEffect(() => {
    try {
      userUpdated();
    } catch (error) {
      console.error('Error updating user', error);
    }
  }, [data, isFetching]);

  return (
    <BaseScrollLayout>
      {(isFetching) ? (<Spinner size="large"/>) : null}
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="w-full">
          <Heading  className="text-center">Home Address</Heading>
          <Text  className="text-center">Where is your home address?</Text>
          <Text  className="text-center">This is necessary to best find neighbors</Text>
          <PlacesTextInput
            value={startLocationText}
            readOnly={false}
            handleSelect={handleHomePlaceSelect}
            handleSelectError={handleHomePlaceSelectError}
            placeId={home?.placeId}
          />
          {sfOnlyWarning.length > 0 ? (
            <Alert action="error" variant="outline">
              <AlertIcon as={InfoIcon} />
              <AlertText>{sfOnlyWarning}</AlertText>
            </Alert>)
          : <Text> </Text>}
        </VStack>
        <HStack>
          <Button
            className="bottom-button shadow-md rounded-lg m-1"
            style={{flex: 1}}
            onPress={() => router.replace('/(secure)/(onboarding)/email')}
            accessibilityLabel="Cancel edit"
            accessibilityHint="Cancel the edit">
              <ButtonText>Back</ButtonText>
          </Button>
          <Button
            className="bottom-button shadow-md rounded-lg m-1"
            style={{flex: 1}}
            isDisabled={home == null}
            onPress={updateAccount}
            testID="update-button"
            accessibilityLabel="Update Account"
            accessibilityHint="Update the user account">
              <ButtonText>Next</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </BaseScrollLayout>
  )
};
