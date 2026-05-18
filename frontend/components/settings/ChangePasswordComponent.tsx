import React, { useState } from "react";
import ChangePasswordController from "./ChangePasswordController";
import { useGlobalContext } from "@/common/GlobalContext";
import { router } from "expo-router";
import { useSession } from "@/common/ctx";
import { Text } from "../ui/text";
import { BaseScrollLayout } from "../layouts/base-scroll-layout";
import { VStack } from "../ui/vstack";
import { Input, InputField } from "../ui/input";
import { Alert, AlertIcon, AlertText } from "../ui/alert";
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { InfoIcon } from "../ui/icon";
import { devLog } from "@/common/utils";

export const ChangePasswordComponent = () => {
  const session = useSession();
  const appContext  = useGlobalContext();
  const controller = new ChangePasswordController(appContext);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setEnteredPassword] = useState('');
  const [passwordConfirm, setEnteredPasswordConfirm] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [passwordConfirmErrorMessage, setPasswordConfirmErrorMessage] = useState('');
  const [backLabel, setBackLabel] = useState('Cancel');

  const updateOldPassword = function(newText: string) {
    setOldPassword(newText);
    setPasswordErrorMessage('');
  }
  const updatePassword = function(newText: string) {
    setEnteredPassword(newText);
    setPasswordErrorMessage('');
    setPasswordConfirmErrorMessage('');
  }
  const updatePasswordConfirm = function(newText: string) {
    setEnteredPasswordConfirm(newText);
    setPasswordConfirmErrorMessage('');
  }
  const verifyPassword = function() {
    const msg = controller.verifyPassword(password)
    setPasswordErrorMessage(msg);
    return msg.length == 0;
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

  const changePassword = function() {
    devLog('change password');
    if(accountInfoValid()) {
      devLog('validated: ' + password);
      const response = controller.changePassword(session, oldPassword, password);
      response.then(msg => {
          devLog('create acct ' + msg);
          if (msg) {
            setPasswordErrorMessage(msg);
          } else {
            setBackLabel('Back to Settings');
            setPasswordConfirmErrorMessage('Password changed successfully');
            setOldPassword('');
            setEnteredPassword('');
            setEnteredPasswordConfirm('');
          }
        })
    } else {
      setPasswordConfirmErrorMessage('Invalid password or password confirmation');
    }
  };

  const backToSettings = function() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/logging-in');
    }
  };

  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="w-full">
          <Text>Current Password</Text>
          <Input
            variant="outline"
            size="md"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
          >
            <InputField
              value={oldPassword}
              onChangeText={updateOldPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Current Password"
              accessibilityHint="Enter your current password"
              placeholder="Enter current password here..."
              testID="currentPasswordInput"/>
          </Input>

          <Text>New Password</Text>
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
              accessibilityLabel="Current Password"
              accessibilityHint="Enter your new password"
              placeholder="Enter new password here..."
              testID="newPasswordInput"/>
          </Input>
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
              testID="passwordConfirmInput"
              accessibilityLabel="Confirm Password"
              accessibilityHint="Re-enter your new password"
              placeholder="Re-enter new password here..."/>
          </Input>
          {passwordErrorMessage.length > 0 ? (
            <Alert action="error" variant="outline">
              <AlertIcon as={InfoIcon} />
              <AlertText>{passwordErrorMessage}</AlertText>
            </Alert>)
            : <Text> </Text>}
          {passwordConfirmErrorMessage.length > 0 ? (
            <Alert action="error" variant="outline">
              <AlertIcon as={InfoIcon} />
              <AlertText>{passwordConfirmErrorMessage}</AlertText>
            </Alert>)
            : <Text> </Text>}
        </VStack>
        <HStack>
          <Button
            className="bottom-button shadow-md rounded-lg m-1"
            action="primary"
            disabled={passwordConfirmErrorMessage.length > 0 || passwordConfirmErrorMessage.length > 0}
            onPress={ changePassword }
            style={{flex: 1}}
            accessibilityLabel="Submit Password Change"
            accessibilityHint="Submits the new password for verification and changing">
            <ButtonText>Update Password</ButtonText>
          </Button>
          <Button
            className="bottom-button shadow-md rounded-lg m-1"
            action="primary"
            onPress={ backToSettings }
            style={{flex: 1}}
            accessibilityLabel="Cancel Password Change"
            accessibilityHint="Cancel password change">
            <ButtonText>{backLabel}</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </BaseScrollLayout>
  );
}

