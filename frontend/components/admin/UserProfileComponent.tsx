import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useGlobalContext } from "../../common/GlobalContext";
import { ensureString, forget, isValidPhone, strippedPhone, fetchUser, isValidEmail, devLog, preprocessFile } from '../../common/utils';
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@/common/ctx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { blankUser, User } from "@/models/User";
import { Place } from 'react-native-google-places-textinput';
import { prLocationFrom } from "@/models/CoSLocation";
import { getPhoto } from "@/common/data-utils";
import * as ImagePicker from 'expo-image-picker';
import { threeMB } from "@/common/constants";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { PlacesTextInput } from "../common/PlacesTextInput";

type SettingsProps = {
  username: string;
};

export const UserProfileComponent: React.FC<SettingsProps> = ({ username }) => {
  const session = useSession();
  const { strava_id } = useLocalSearchParams();

  devLog("RunnerProfileComponent Username:", username);
  const queryClient = useQueryClient();
  const appContext  = useGlobalContext();
  appContext.setSession(session);
  const [readOnly, setReadOnly] = useState(true);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [mobileErrorMessage, setMobileErrorMessage] = useState('');
  const [warnAgainstDeleting, setWarnAgainstDeleting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [startLocationText, setStartLocationText] = useState('');
  const [home, setHome] = useState<any | null>(null);
  const [notesDoc, setNotesDoc] = useState<any | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [enteringInstructions, setEnteringInstructions] = useState('');
  const [initialized, setInitialized] = useState(false);

  const syncGoogleMapsKey = async () => {
    setGoogleMapsApiKey(await appContext.getGoogleMapsAPIKey(session, ''));
  }

  const { data, isFetching } = useQuery({
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

  const [firstName, setEnteredFirstName] = useState(ensureString(data?.firstName));
  const [lastName, setEnteredLastName] = useState(ensureString(data?.lastName));
  const [email, setEnteredEmail] = useState(ensureString(data?.email));
  const [mobile, setEnteredMobile] = useState(ensureString(data?.mobile));
  const [image, setImage] = useState<string>('');

  const updateFirstName = function(newText: string) {
    setEnteredFirstName(newText);
  }
  const updateLastName = function(newText: string) {
    setEnteredLastName(newText);
  }
  const updateEmail = function(newText: string) {
    setEnteredEmail(newText);
  }
  const updateMobile = function(newText: string) {
    if (newText.length == 0 || isValidPhone(newText)) {
      setMobileErrorMessage('');
    }
    setEnteredMobile(strippedPhone(newText));
  }

  function handleHomePlaceSelect(place: Place, sessionToken?: string | null | undefined): void {
    devLog('Place Selected: ', place);
    devLog('Session Token: ', sessionToken);
    if (readOnly) return;
    dirty();
    if (place) {
      if (home && home.placeId === place.placeId) {
        console.log('Home place already selected');
        return;
      }
      console.log('Place details: ', place.details);
      setHome(prLocationFrom(place));
      setStartLocationText(place.details?.formattedAddress);
      console.log('startLocationText places: ', place.details?.displayName?.text);
      // setStartLocation(place);
      // setStartLocationText(place.formatted_address);
      // setPredefinedPlaces([place]);
    } else {
      setHome(null);
    }
  }

  const handleHomePlaceSelectError = (error: Error) => {
    console.error(error.message);
    setErrorMessage('Failed to fetch address');
    devLog('googleAPI key: ', googleMapsApiKey);
  }

  const validateEmail = () => {
    if (email.length === 0 || isValidEmail(email)) {
      setEmailErrorMessage('');
      return true;
    }
    setEmailErrorMessage('Invalid email');
  };

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
    return validatePhone() && validateEmail();
  }

  const dirty = () => {
    setIsDirty(true);
  }

  const updateAccount = async function() {
    if (!validate()) {
      console.log('Not valid');
      return;
    }
    // const responsePromise = await controller.updateAccount(
    //   session,
    //   username,
    //   firstName,
    //   lastName,
    //   email,
    //   mobile,
    //   home,
    //   enteringInstructions,
    // );
    // const response = await responsePromise;
    const response = '';
    if (response === '') {
      setIsDirty(false);
      setReadOnly(true);
      invalidateUser();
      setErrorMessage('');
    } else {
      setErrorMessage(`account: ${response}`);
    }
  };

  const cancel = () => {
    setIsDirty(false);
    setReadOnly(true);
    syncUser();
  }

  const userUpdated = async () => {
    if (isDirty) {
      return;
    }
    syncUser();
  }

  const syncImage = async (user: User | null) => {
    let imageUrl: string | null = null;
    if (user?.photo != null) {
      const image = await getPhoto(queryClient, session, user.photo.id, username);
      imageUrl = ensureString(image?.presignedURL);
    }
    setImage(ensureString(imageUrl));
  }

  const syncUser = async () => {
    devLog('Syncing user: ', username);
    setEnteredFirstName(ensureString(data?.firstName));
    setEnteredLastName(ensureString(data?.lastName));
    setEnteredEmail(ensureString(data?.email));
    setEnteredMobile(ensureString(data?.mobile));
    setEnteringInstructions(ensureString(data?.entryInstructions));
    if (data?.homeLocation) {
      setHome(data.homeLocation);
      setStartLocationText(data.homeLocation.formattedAddress);
    } else {
      setHome(null);
      setStartLocationText('');
    }
    syncImage(data);

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

  const updateImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      base64: false,
    });

    devLog("image result: ", result);

    if (result.canceled) {
      return;
    }

    let message = ''
    const asset = result.assets[0];
    const preProcessedFile = await preprocessFile(asset);
    devLog('File uri: ', asset.uri);

    if (!preProcessedFile) {
      message = 'Failed to process file.';
    } else if (preProcessedFile.size > threeMB) {
      devLog('File size: ', preProcessedFile.size);
      message = 'Image size is too large. Please select a smaller image.';
    } else {
      // message = await controller.updateUserPhoto(session, username, preProcessedFile);
      setImage(asset.uri);
    }

    setErrorMessage(message);
  }

  const deleteAccount = async () => {
    // const msg = await controller.deleteAccount(session, username);
    // invalidateUser();
    // router.replace('/(secure)/(home)/admin/user-list');
  }

 const DeleteAccountComponent = () => {
   return (
      <AlertDialog isOpen={warnAgainstDeleting}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogCloseButton />
          </AlertDialogHeader>
          <AlertDialogBody>
            <VStack>
              <Heading size="md" className="text-typography-950 font-semibold">
                Are you sure you want to detele your account?
              </Heading>
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
                className="bottom-button shadow-md rounded-lg m-1"
                variant="outline"
                action="secondary"
                onPress={() => setWarnAgainstDeleting(false)}
                size="sm">
              <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                  className="bottom-button shadow-md rounded-lg m-1"
                  size="sm"
                  onPress={deleteAccount}>
                <ButtonText>Delete Account</ButtonText>
            </Button>
              </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
   );
 }

  useEffect(() => {
    try {
      devLog('Fetching user: ', username);
      userUpdated();
    } catch (error) {
      console.error('Error updating user', error);
    }
  }, [data, isFetching]);

  useEffect(() => {
    if (!initialized) {
      syncGoogleMapsKey();
      setInitialized(true);
    }
  }, [initialized]);

  if (isFetching) return <Spinner size="large"/>;

  return (
    <VStack className="w-full h-full">
      <ScrollView
        className="w-full h-full"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <HStack className="w-full h-full bg-background-0 flex-grow justify-center">
          <VStack
            className=" h-full w-full flex-1  items-center justify-center"
            space="sm"
          >

        <VStack className="max-w-[440px] w-full" space="md">
          <Heading size="lg">Profile: {username}</Heading>
          <VStack className="w-full">
            <HStack className="justify-between mb-4">
            <Pressable onPress={updateImage} accessibilityLabel="User Image" accessibilityHint="Update the user image">
              <Avatar size="lg" className="bg-blue-500">
                <AvatarFallbackText>
                  +
                </AvatarFallbackText>
                {image && (
                  <AvatarImage
                    source={{ uri: ensureString(image) }}
                  />
                )}
              </Avatar>
              {image ? null : (<Text className="text-sm text-typography-600">Add Photo</Text>)}
            </Pressable>
            </HStack>
            <Text>First Name</Text>
            <Input
              variant="outline"
              size="md"
              isReadOnly={readOnly}
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
              isReadOnly={readOnly}
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
            {emailErrorMessage.length > 0 ? (
              <Text className="text-sm text-error-900">{emailErrorMessage}</Text>
            ) : null}
            <Text>Mobile</Text>
            <Input
              variant="outline"
              size="md"
              isReadOnly={readOnly}
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
            <Text>Home Address</Text>
            <PlacesTextInput
              value={startLocationText}
              readOnly={readOnly}
              handleSelect={handleHomePlaceSelect}
              handleSelectError={handleHomePlaceSelectError}
              placeId={home?.placeId}
            />
          </VStack>
          {readOnly ? null : (
            <Button
            className="shadow-md rounded-lg m-1"
            style={{flex: 1}}
            onPress={() => setWarnAgainstDeleting(true)}
            accessibilityLabel="Delete Account"
            accessibilityHint="Delete the user account">
              <ButtonText>Delete Account</ButtonText>
            </Button>)}

          <HStack>
            {readOnly ? (
              <Button
                className="bottom-button shadow-md rounded-lg m-1"
                style={{flex: 1}}
                onPress={() => setReadOnly(false)}
                testID="edit-button"
                accessibilityLabel="Edit Account"
                accessibilityHint="Edit the user account">
                  <ButtonText>Edit</ButtonText>
              </Button>
            )
              : (<Button
                className="bottom-button shadow-md rounded-lg m-1"
                style={{flex: 1}}
                isDisabled={emailErrorMessage.length > 0 || mobileErrorMessage.length > 0}
                onPress={updateAccount}
                testID="update-button"
                accessibilityLabel="Update Account"
                accessibilityHint="Update the user account">
                  <ButtonText>Update</ButtonText>
              </Button>)}
            <DeleteAccountComponent />
            {readOnly ? null : (
              <Button
                className="bottom-button shadow-md rounded-lg m-1"
                style={{flex: 1}}
                onPress={cancel}
                accessibilityLabel="Cancel edit"
                accessibilityHint="Cancel the edit">
                  <ButtonText>Cancel</ButtonText>
              </Button>)}
          </HStack>
        </VStack>
      </VStack>
    </HStack>

    </ScrollView>
    </VStack>
  );
};
