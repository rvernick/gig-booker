import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../common/GlobalContext";
import { ensureString, forget, fetchUser, isValidEmail } from '../../common/utils';
import { useSession } from "@/common/ctx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
// import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "@/components/ui/radio";
// import { CircleIcon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import { blankUser, User } from "@/models/User";
import { BaseLayout } from "../layouts/base-layout";
import OnboardingController from "./OnboardingController";
import { router } from "expo-router";
import { Heading } from "../ui/heading";

export const EmailComponent: React.FC = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const username = session.username ? session.username : '';
  const appContext  = useGlobalContext();
  appContext.setSession(session);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

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
    console.log('Invalidate user: ' + username);
    queryClient.removeQueries({queryKey: ['user', username]});
    forget("ff.preferences");
    setIsDirty(false);
  }

  const [email, setEnteredEmail] = useState(ensureString(data?.email));

  const updateEmail = function(newText: string) {
    dirty();
    setEnteredEmail(newText);
    if (isValidEmail(newText)) {
      setEmailErrorMessage('');
    }
  }

  const validateEmail = () => {
    if (email.length === 0 || isValidEmail(email)) {
      setEmailErrorMessage('');
      return true;
    }
    setEmailErrorMessage('Invalid email');
  }

  const validate = () => {
    return validateEmail();
  }

  const dirty = () => {
    setIsDirty(true);
  }

  const updateAccount = async function() {
    if (!validate()) {
      console.log('Not valid');
      return;
    }
    const response = await controller.updateEmail(
      session,
      username,
      email,
    );
    if (response === '') {
      setIsDirty(false);
      invalidateUser();
      router.replace('/(secure)/(onboarding)/emailVerify');
    } else {
      setEmailErrorMessage(response);
    }
  };

  const userUpdated = async (user: User) => {
    if (isDirty) {
      return;
    }
    if (user.email) {
      router.replace('/(secure)/(onboarding)/emailVerify');
    } else {
      syncUser(user);
    }
  }

  const syncUser = async (user: User) => {
    setEnteredEmail(ensureString(user?.email));
  }

  useEffect(() => {
    try {
      if (data) {
        userUpdated(data);
      }
    } catch (error) {
      console.error('Error updating user', error);
    }
  }, [data, isFetching]);

  if (isFetching) return <Spinner size="large"/>;

  return (
    <BaseLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <Heading size="lg">EMAIL </Heading>
        <Text>Enter your email address to sign up with Gig Booker</Text>
        <Input
          variant="outline"
          size="md"
          isReadOnly={false}
          isDisabled={false}
          isInvalid={false}
        >
          <InputField
            value={email}
            onChangeText={updateEmail}
            onBlur={validateEmail}
            inputMode="email"
            testID="email"
            accessibilityLabel="Email"
            accessibilityHint="Email"/>
        </Input>
        {emailErrorMessage.length > 0 ? (
          <Text className="text-sm text-error-900">{emailErrorMessage}</Text>
        ) : null}
        <HStack>
          <Button
            className="bottom-button shadow-md rounded-lg m-1"
            style={{flex: 1}}
            isDisabled={!isDirty || emailErrorMessage.length > 0}
            onPress={updateAccount}
            testID="update-button"
            accessibilityLabel="Update Account"
            accessibilityHint="Update the user account">
              <ButtonText>Next</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </BaseLayout>
  )
};
