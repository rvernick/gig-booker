import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../common/GlobalContext";
import { ensureString, forget, isValidPhone, strippedPhone, fetchUser, devLog } from '../../common/utils';
import { router } from "expo-router";
import { useSession } from "@/common/ctx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseScrollLayout } from "../layouts/base-scroll-layout";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { blankUser } from "@/models/User";
import ProfileController from "../settings/ProfileController";

export const NameAndPhoneComponent: React.FC = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const username = session.username ? session.username : '';
  const appContext  = useGlobalContext();
  appContext.setSession(session);
  const [mobileErrorMessage, setMobileErrorMessage] = useState('');

  const controller = new ProfileController(appContext);

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
  }

  const [firstName, setEnteredFirstName] = useState(ensureString(data?.firstName));
  const [lastName, setEnteredLastName] = useState(ensureString(data?.lastName));
  const [mobile, setEnteredMobile] = useState(ensureString(data?.mobile));

  const updateFirstName = function(newText: string) {
    setEnteredFirstName(newText);
  }
  const updateLastName = function(newText: string) {
    setEnteredLastName(newText);
  }
  const updateMobile = function(newText: string) {
    if (newText.length == 0 || isValidPhone(newText)) {
      setMobileErrorMessage('');
    }
    setEnteredMobile(strippedPhone(newText));
  }

  const validatePhone = () => {
    // Simple phone number validation
    devLog('validating: ' + mobile);
    if (mobile.length == 0 || isValidPhone(mobile)) {
      setMobileErrorMessage('');
      return true;
    } else {
      console.log('Invalid phone number');
      setMobileErrorMessage('Invalid phone number');
      return false;
    }
  };

  const validate = () => {
    return validatePhone();
  }

  const updateAccount = async function() {
    if (!validate() || data == null) {
      console.log('Not valid');
      return;
    }
    const response = await controller.updateAccount(
      session,
      username,
      firstName,
      lastName,
      mobile,
      data.homeLocation ? data.homeLocation : null,
      ''
    );
    if (response === '') {
      router.replace('/(secure)/(home)/(help-requests)/requests')
    } else {
      setMobileErrorMessage(response);
    }
  };

  const userUpdated = async () => {
    syncUser();
  }

  const syncUser = async () => {
    setEnteredFirstName(ensureString(data?.firstName));
    setEnteredLastName(ensureString(data?.lastName));
    setEnteredMobile(ensureString(data?.mobile));
    devLog('User ', JSON.stringify(data));
    devLog('User source: ', data?.source);
  }

  const phoneFormat = (phoneWithEverything: string) => {
    const phone = strippedPhone(phoneWithEverything);
    if (phone.length == 0) {
      return '';
    }
    if (phone.length < 4) {
      return "(" + phone;
    }
    if (phone.length <= 6) {
      return '(' + phone.slice(0, 3) + ') '+ phone.slice(3);
    }
    if (phone.length <= 10) {
      return '(' + phone.slice(0, 3) + ') '+ phone.slice(3, 6) + '-' + phone.slice(6);
    }
    return phone;
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
        <VStack className="w-full">
          <Text>First Name</Text>
          <Input
            variant="outline"
            size="md"
            isReadOnly={false}
            isDisabled={false}
            isInvalid={false}
          >
            <InputField
              value={firstName}
              onChangeText={updateFirstName}
              inputMode="text"
              testID="first-name"
              accessibilityLabel="First Name"
              accessibilityHint="First Name"/>
          </Input>
          <Text>Last Name</Text>
          <Input
            variant="outline"
            size="md"
            isReadOnly={false}
            isDisabled={false}
            isInvalid={false}
          >
            <InputField
              value={lastName}
              onChangeText={updateLastName}
              inputMode="text"
              testID="last-name"
              accessibilityLabel="Last Name"
              accessibilityHint="Last Name"/>
          </Input>
          <Text>Mobile</Text>
          <Input
            variant="outline"
            size="md"
            isReadOnly={false}
            isDisabled={false}
            isInvalid={false}
          >
            <InputField
              value={phoneFormat(mobile)}
              onChangeText={updateMobile}
              onBlur={validatePhone}
              keyboardType="phone-pad"
              accessibilityLabel="Mobile number"
              accessibilityHint="Mobile number"/>
          </Input>
          {mobileErrorMessage.length > 0 ? (
            <Text className="text-sm text-error-900">{mobileErrorMessage}</Text>
          ) : null}
        </VStack>
        <HStack>
          <Button
            className="bottom-button shadow-md rounded-lg m-1"
            style={{flex: 1}}
            isDisabled={firstName.length === 0 || lastName.length === 0 || mobile.length === 0 || mobileErrorMessage.length > 0}
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
