import React, { useState } from "react";
import { invalidPasswordMessage, isDevelopment, isValidEmail, isValidPassword, login } from '../../common/utils';
import { router } from "expo-router";
import CreateAccountController from "./CreateAccountController";
import { BaseScrollLayout } from "../layouts/base-scroll-layout";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { InfoIcon } from "@/components/ui/icon";
import { Link, LinkText } from "@/components/ui/link";
import { useSession } from "@/common/ctx";

interface CreateAccountComponentProps {
  controller: CreateAccountController;
}

export const CreateAccountComponent: React.FC<CreateAccountComponentProps> = ({ controller }) => {
  const defaultPassword = isDevelopment() ? 'h@ppyHappy' : '';
  const [email, setEnteredEmail] = useState('');
  const [password, setEnteredPassword] = useState(defaultPassword);
  const [passwordConfirm, setEnteredPasswordConfirm] = useState(defaultPassword);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [passwordConfirmErrorMessage, setPasswordConfirmErrorMessage] = useState('');
  const session = useSession();

  const updateEmail = function(newText: string) {
    setEnteredEmail(newText);
    setEmailErrorMessage('');
  }
  const updatePassword = function(newText: string) {
    setEnteredPassword(newText);
    setPasswordErrorMessage('');
  }
  const updatePasswordConfirm = function(newText: string) {
    setEnteredPasswordConfirm(newText);
    setPasswordConfirmErrorMessage('');
  }

  const verifyEmail = function() {
    if (isValidEmail(email)) {
      setEmailErrorMessage('');
      return true;
    } else {
      setEmailErrorMessage('Please enter valid email');
      return false;
    }
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
    return verifyEmail()
      && verifyPassword()
      && verifyPasswordMatch();
  };

  const apply = async function() {
    if (!accountInfoValid()) {
      return;
    }
    const msg = await controller.apply(email, password);
    if (msg) {
      setEmailErrorMessage(msg);
    } else {
      const li = await login(email, password, session);
      if (li && li.length > 0) {
        setEmailErrorMessage(li);
        return;
      } else {
        router.replace('/logging-in');
      }
    }
  };

  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <VStack>
            <Heading className="text-center" size="3xl">
              New Account
            </Heading>
            <Text className="text-center">Neighbors helping each other at the click of a button</Text>
            <Text className="text-center">Please enter your information to create an account</Text>
            <Text> </Text>
          </VStack>
        </VStack>
        <VStack className="w-full">
          <VStack space="md" className="w-full"></VStack>
            <Text>Email</Text>
            <Input
              variant="outline"
              size="md"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
            >
              <InputField
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={updateEmail}
                onBlur={verifyEmail}
                placeholder="Enter email here..."
                testID="emailInput"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                accessibilityLabel="email"
                accessibilityHint="The email address of the user being created"/>
            </Input>
            {emailErrorMessage.length > 0 ? (
              <Alert action="error" variant="outline">
                <AlertIcon as={InfoIcon} />
                <AlertText>{emailErrorMessage}</AlertText>
              </Alert>)
             : <Text> </Text>}

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
                  inputMode="text"
                  textContentType="password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={verifyPassword}
                  testID="passwordInput"
                  accessibilityLabel="password"
                  accessibilityHint="A password of at least 8 characters with a mix of special, upper and lower case'"
                  autoComplete="password"
                  placeholder="Enter password here..."/>
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
                inputMode="text"
                textContentType="password"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                testID="passwordConfirmInput"
                accessibilityLabel="password confirm"
                accessibilityHint="Re-enter the password to confirm it"
                autoComplete="email"
                placeholder="Confirm password..."/>
            </Input>
            {passwordConfirmErrorMessage.length > 0 ? (
              <Alert action="error" variant="outline">
                <AlertIcon as={InfoIcon} />
                <AlertText>{passwordConfirmErrorMessage}</AlertText>
              </Alert>)
             : <Text> </Text>}
            <Button size="md" variant="solid"
                className="bottom-button shadow-md rounded-lg m-1"
                action="primary"
                onPress={apply}
                disabled={emailErrorMessage.length > 0 || passwordConfirmErrorMessage.length > 0 || passwordErrorMessage.length > 0}
                testID="submitButton"
                accessibilityLabel="Sign Up Button"
                accessibilityHint="The button to submit the info to create the new account">
              <ButtonText>Sign Up</ButtonText>
            </Button>
        </VStack>
        <Link onPress={() => router.push("/(sign-in-sign-up)/(sign-in)/sign-in-with-email")}>
          <LinkText className="font-medium text-sm text-primary-700 group-hover/link:text-primary-600">
            I have an account
          </LinkText>
      </Link>
      <Link isExternal={true} href="https://www.cup-of-sugar.com">
        <LinkText className="font-medium text-sm text-primary-700 group-hover/link:text-primary-600">Who we are</LinkText>
      </Link>
      </VStack>
    </BaseScrollLayout>
  );
};
