import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../common/GlobalContext";
import { forget, fetchUser, devLog } from '../../common/utils';
import { useSession } from "@/common/ctx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseScrollLayout } from "../layouts/base-scroll-layout";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "../ui/checkbox";
import { HStack } from "@/components/ui/hstack";
import { blankUser } from "@/models/User";
import { CheckIcon } from "../ui/icon";
import OnboardingController from "./OnboardingController";
import { Button, ButtonText } from "../ui/button";
import { useRouter } from "expo-router";

export const TermsAndConditionsComponent: React.FC = () => {
  const session = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const username = session.username ? session.username : '';
  const appContext  = useGlobalContext();
  appContext.setSession(session);
  const [isDirty, setIsDirty] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [waiverViewed, setWaiverViewed] = useState(false);

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

  const acceptTerms = async function() {
    const response = await controller.acceptTerms(
      session,
      username,
    );
    if (response === '') {
      setIsDirty(false);
      invalidateUser();
      forget('onboarding')
    }
  };

  const userUpdated = async () => {
    if (isDirty) {
      return;
    }
    syncUser();
  }

  const viewWaiver = async function() {
    setWaiverViewed(true);
    devLog('Viewing waiver', waiverViewed);
  }

  const syncUser = async () => {
  }

  useEffect(() => {
    try {
      userUpdated();
    } catch (error) {
      console.error('Error updating user', error);
    }
  }, [data, isFetching]);

  if (isFetching) return <Spinner size="large"/>;

  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <VStack>
            <Heading className="text-center" size="3xl">
              Gig Booker Terms of Service
            </Heading>
            <Text className="text-center"> </Text>
            <Text className="text-center"></Text>
            <Text className="text-center">Neighbors helping neighbors</Text>
            <Text className="text-center">It should be easier to help neighbors</Text>
            <Button
              className="bottom-button shadow-md rounded-lg m-1"
              style={{flex: 1}}
              isDisabled={false}
              onPress={viewWaiver}
              testID="update-button"
              accessibilityLabel="View Waiver"
              accessibilityHint="View the Waiver">
                <ButtonText>View Waiver</ButtonText>
            </Button>
            <Checkbox
              isDisabled={!waiverViewed}
              isInvalid={false}
              isChecked={agreeTerms}
              onChange={(newVal: boolean | ((prevState: boolean) => boolean)) => setAgreeTerms(newVal)}
              value={'I agree'} size="md"
              >
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>I agree</CheckboxLabel>
            </Checkbox>
            <Text> </Text>
          </VStack>
        </VStack>
        <HStack>
          <Button
            className="bottom-button shadow-md rounded-lg m-1"
            style={{flex: 1}}
            onPress={() => router.replace('/(secure)/(onboarding)/address')}
            accessibilityLabel="Cancel edit"
            accessibilityHint="Cancel the edit">
              <ButtonText>Back</ButtonText>
          </Button>
          <Button
            className="bottom-button shadow-md rounded-lg m-1"
            style={{flex: 1}}
            isDisabled={!agreeTerms}
            onPress={acceptTerms}
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
