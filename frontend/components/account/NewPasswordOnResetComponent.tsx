import React, { useState } from "react";
import { devLog, invalidPasswordMessage, isValidPassword } from '@/common/utils';
import { router, useLocalSearchParams } from "expo-router";
import { post } from "@/common/http-utils";
import { BaseScrollLayout } from "../layouts/base-scroll-layout";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { InfoIcon } from "@/components/ui/icon";

interface NewPasswordOnResetProps {
  token: string;
}

export const NewPasswordOnResetComponent: React.FC<NewPasswordOnResetProps> = () => {
  const { token } = useLocalSearchParams();
  const [password, setEnteredPassword] = useState('');
  const [passwordConfirm, setEnteredPasswordConfirm] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [passwordConfirmErrorMessage, setPasswordConfirmErrorMessage] = useState('');

  const updatePassword = function(newText: string) {
    setEnteredPassword(newText);
    setPasswordErrorMessage('');
  }
  const updatePasswordConfirm = function(newText: string) {
    setEnteredPasswordConfirm(newText);
    setPasswordConfirmErrorMessage('');
  }

  const verifyPassword = function() {
    if (isValidPassword(password)) {
      setPasswordErrorMessage('');
      return true;
    } else {
      setPasswordErrorMessage(invalidPasswordMessage);
      return false;
    }
  }

  const verifyPasswordMatch = function() {
    if (password != passwordConfirm) {
      setPasswordConfirmErrorMessage('Passwords must match');
      return false;
    }
    return true;
  }

  const accountInfoValid = function() {
    return verifyPassword()
      && verifyPasswordMatch();
  };

  const callResetPassword = async function() {
     if (!accountInfoValid()) {
      return;
    }
    try {
      const body = {
        token: token,
        password: password,
      };

      const response = await post('/auth/reset-password', body, null);
      if (response.ok) {
        router.replace('/sign-in');
      } else {
        const result = await response.json();
        devLog('json'+ result);
        setPasswordConfirmErrorMessage(result.message);
      }
    } catch(e: any) {
      console.log(e.message);
      setPasswordConfirmErrorMessage('Unable to Reset Password');
    }
  }

  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <VStack>
            <Heading className="text-center" size="3xl">
              Create New Password
            </Heading>
            <Text> </Text>

          </VStack>
        </VStack>
        <VStack className="w-full">
          <Text>Password</Text>
          <Input
            variant="outline"
            size="md"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
          >
            <InputField
              value={password}
              onChangeText={updatePassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              testID="passwordInput"
              accessibilityLabel="Password Input"
              accessibilityHint="New password for account"
              autoComplete="password"
              onBlur={verifyPassword}
              placeholder="Enter password here..."
              textContentType="password"/>
          </Input>
          {passwordErrorMessage.length > 0 ? (
            <Alert action="error" variant="outline">
              <AlertIcon as={InfoIcon} />
              <AlertText>{passwordErrorMessage}</AlertText>
            </Alert>)
            : <Text> </Text>}

          <Text>Confirm Password</Text>
          <Input
            variant="outline"
            size="md"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
          >
            <InputField
              value={passwordConfirm}
              onChangeText={updatePasswordConfirm}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Password Confirmation Input"
              accessibilityHint="Re-enter new password to confirm"
              inputMode="text"
              textContentType="password"
              onBlur={verifyPassword}
              autoComplete="password"
              placeholder="Confirm password..."
              testID="passwordConfirmInput"/>
          </Input>
          {passwordConfirmErrorMessage.length > 0 ? (
            <Alert action="error" variant="outline">
              <AlertIcon as={InfoIcon} />
              <AlertText>{passwordConfirmErrorMessage}</AlertText>
            </Alert>)
            : <Text> </Text>}
          <Button variant="solid"
            className="bottom-button shadow-md rounded-lg m-1"
            onPress={callResetPassword}
            accessibilityLabel="Submit New Password"
            accessibilityHint="Validates and updates passord for the account"
              action="primary"
              // disabled={!(isValidEmail(email) || email === DEVELOPER)}
              testID="submitButton"
          >
            <ButtonText>Set Password</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </BaseScrollLayout>
  );
}
