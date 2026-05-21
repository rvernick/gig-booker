import React, { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { login, remind, isMobile, loginWithVerifyCode, forget, devLog } from '@/common/utils';
import { baseUrl } from "../../common/http-utils";
import { router } from "expo-router";
import * as LocalAuthentication from 'expo-local-authentication';
import { useSession } from "@/common/ctx";
import { useQuery } from "@tanstack/react-query";
import { BaseScrollLayout } from "@/components/layouts/base-scroll-layout";
import { VStack } from "@/components/ui/vstack";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { Link, LinkText } from "@/components/ui/link";
import { Button, ButtonText } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react-native";
import { useToast } from "@/components/ui/toast";
import { FACE_ID_PASSWORD, FACE_ID_USERNAME } from "@/common/constants";

export const LoginWithEmailComponent = () => {
  const session = useSession();
  let maxAttempts = 120;

  let user = '';
  let pword = '';

  if (baseUrl().includes('localhost:')) {
    user = 't5@t.com';
    pword = 'h@ppyHappy';
    maxAttempts = 10;
  }

  const [devFastLogin, setDevFastLogin] = useState(true);
  const [useFaceRecognition, setUseFaceRecognition] = useState(isMobile());
  const [canUseFaceId, setCanUseFaceId] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [verifyCodes, setVerifyCodes] = useState<string[]>([]);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [attemptingFaceIdLogin, setAttemptingFaceIdLogin] = useState(false);

  const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email(),
    password: z.string().min(1, "Password is required"),
  });

  const { data: loggedInWithVerifyCode, isFetching: helpFetching, error: helpError} = useQuery({
      queryKey: ['loginWithVerifyCode'],
      queryFn: () => attemptLoginUsingVerifyCodes(),
      initialData: false,
      refetchInterval: 1000,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
      refetchOnMount: 'always',
    })

  type LoginSchemaType = z.infer<typeof loginSchema>;

  const onSubmit = (data: LoginSchemaType) => {
    attemptLoginUsing(data.email, data.password);
  };

  const handleState = () => {
    setPasswordHidden((showState) => {
      return !showState;
    });
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<LoginSchemaType>({
      resolver: zodResolver(loginSchema),
    });
    const toast = useToast();
    const [validated, setValidated] = useState({
      emailValid: true,
      passwordValid: true,
    });

  const attemptLoginUsing = (username: string, pass: string) => {
    const loginAttempt = login(username, pass, session);
    processLoginAttempt(loginAttempt, [FACE_ID_USERNAME, FACE_ID_PASSWORD]);
  }

  const processLoginAttempt = (attempt: Promise<string | undefined>, savedCodes: string[]) => {
    // invalidateLoginConfirmation();
    attempt
      .then(msg => {
        devLog('loginAttempt: ' + msg);
        if (msg) {
          turnOffFaceRecognition();
          setValidated({ emailValid: true, passwordValid: false });
          savedCodes.forEach(code => {forget(code)});
        } else {
          console.log('attemptLogin successful');
          setVerifyCodes([]);
          goToHomeIfHasJWT(true);
        }
      })
      .catch(error => {
        console.log('Failed to log in ' + error.message);
        setValidated({ emailValid: true, passwordValid: false });
        turnOffFaceRecognition();
      });
  }

  const attemptLoginUsingVerifyCode = (code: string) => {
    devLog('Logging in... ' + verifyAttempts + ' ' + code);
    const loginAttempt = loginWithVerifyCode(code, session);
    processLoginAttempt(loginAttempt, []);
  }

  const attemptLoginUsingVerifyCodes = () => {
    if (verifyAttempts > maxAttempts) return false;
    setVerifyAttempts(verifyAttempts + 1);
    verifyCodes.forEach(code => { attemptLoginUsingVerifyCode(code) });
    return false;
  }

  const turnOffFaceRecognition = () => {
    setUseFaceRecognition(false);
  }

  const isLoggedIn = () => {
    return session.jwt_token && session.jwt_token.length > 0;
  }

  const attemptLoginViaDeviceId = async () => {
    const lastUser = await remind(FACE_ID_USERNAME);
    const lastPass = await remind(FACE_ID_PASSWORD);
    if (lastUser && lastPass) {
      await attemptLoginUsing(lastUser, lastPass);
    } else {
      turnOffFaceRecognition();
    }
  }

  const isFaceIdPossible = async (): Promise<boolean> => {
    if (!isMobile()) {
      return false;
    }
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    const hasBiometrics = await LocalAuthentication.isEnrolledAsync();

    return hasHardware
      && hasBiometrics
      && types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      && await hasFaceIdData()
  }

  const hasFaceIdData = async (): Promise<boolean> => {
    const lastUser =  await remind(FACE_ID_USERNAME);
    const lastPass = await remind(FACE_ID_PASSWORD);

    return (lastUser.length > 0 && lastPass.length > 0);
  }

  const confirmUseFaceRecognition = async () => {
    if (!isMobile()) {
      setUseFaceRecognition(false);
      setCanUseFaceId(false);
      return false;
    }
    if (await isFaceIdPossible()) {
      setCanUseFaceId(true);
      return true;
    } else {
      setUseFaceRecognition(false);
      setCanUseFaceId(false);
      return false;
    }
  }

  const loginWithFaceRecognition = async () => {
    try {
      const attemptingFaceIdLoginAlready = attemptingFaceIdLogin;
      setAttemptingFaceIdLogin(true);
      if (isLoggedIn() || attemptingFaceIdLoginAlready) return;

      const confirm = await isFaceIdPossible();
      if (confirm) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Scan your face to log in',
          cancelLabel: 'Cancel',
        });
        if (result.success) {
          devLog('Face ID login successful');
          attemptLoginViaDeviceId();
        } else {
          devLog('Face ID login failed');
          turnOffFaceRecognition();
          setValidated({ emailValid: true, passwordValid: false });
        }
      }
    } catch (error) {
      console.log('Failed to authenticate with face ID:'+ error);
    } finally {
      setAttemptingFaceIdLogin(false);
    }
  }

  const prepareFaceRecognition = async () => {
    if (useFaceRecognition) {
      loginWithFaceRecognition();
    }
    if (!canUseFaceId || !useFaceRecognition) {
      confirmUseFaceRecognition();
    }
  }

  const goToHomeIfHasJWT = (force: boolean = false) => {
    if (isLoggedIn()) {
      router.replace({
        pathname: '/logging-in',
        params: { jwt_token: session.jwt_token },
      });
    } else if (force) {
      router.replace('/logging-in');
    } else {
      console.log('No JWT token found, redirecting to home');
    }
  }

  useEffect(() => {
    if (devFastLogin) {
      devLog('Dev fast login enabled');
      setDevFastLogin(false);
      if (baseUrl().includes('localhost:')) {
        devLog('Dev fast login: using local user');
        loginSchema.parseAsync({ email: 't5@t.com', password: 'h@ppyHappy' });
      }
    }
    if (!canUseFaceId) {
      confirmUseFaceRecognition();
    }
    goToHomeIfHasJWT();
  }, []);

  useEffect(() => {
    prepareFaceRecognition();
  }, [useFaceRecognition, canUseFaceId]);

  if (useFaceRecognition && canUseFaceId) {
    return (
      <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md"></VStack>
      </BaseScrollLayout>
      // <Surface>
      //   <Text>Face Recognition</Text>
      // </Surface>
    );
  }
  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <VStack>
            {isMobile() && (<Heading size="lg"></Heading>)}
            <Heading className="md:text-center" size="3xl">
              Log in
            </Heading>
            <Text>Login to start using Gig Booker</Text>
          </VStack>
        </VStack>
      <VStack className="w-full">
        <VStack space="xl" className="w-full">
          <FormControl
            isInvalid={!!errors?.email || !validated.emailValid}
            className="w-full"
          >
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue={user}
              name="email"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await loginSchema.parseAsync({ email: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    keyboardType="email-address"
                    inputMode="email"
                    textContentType="emailAddress"
                    autoComplete="email"
                    autoCapitalize="none"
                    testID="emailInput"
                    accessibilityLabel="email input"
                    accessibilityHint="The email address for the account being logged in"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.email?.message ||
                  (!validated.emailValid && "Email ID not found")}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          {/* Label Message */}
          <FormControl
            isInvalid={!!errors.password || !validated.passwordValid}
            className="w-full"
          >
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue={pword}
              name="password"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await loginSchema.parseAsync({ password: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    type={passwordHidden ? "password" : "text"}
                    placeholder="Enter password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    inputMode="text"
                    testID="passwordInput"
                    accessibilityLabel="password input"
                    accessibilityHint="The password for the account being logged in"
                  />
                  <InputSlot onPress={handleState} className="pr-3">
                    <InputIcon as={passwordHidden ? EyeOffIcon : EyeIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.password?.message ||
                  (!validated.passwordValid && "Password was incorrect")}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <HStack className="w-full justify-between ">
            <Link onPress={() => router.push('/(sign-in-sign-up)/(sign-in)/password-reset')}>
              <LinkText className="font-medium text-sm text-primary-700 group-hover/link:text-primary-600">
                Forgot Password?
              </LinkText>
            </Link>
          </HStack>
        </VStack>
        <VStack className="w-full my-7 " space="lg">
          <Button
              className="bottom-button shadow-md rounded-lg m-1"
              onPress={handleSubmit(onSubmit)}>
            <ButtonText className="font-medium">Log in</ButtonText>
          </Button>
          {canUseFaceId ? (
            <Link onPress={() => loginWithFaceRecognition()}>
              <LinkText
                className="self-center font-medium text-primary-700 group-hover/link:text-primary-600  group-hover/pressed:text-primary-700"
                size="md"
              >
                [ Use Face ID ]
              </LinkText>
            </Link>)
            : null }
          {/* <Pressable onPress={loginWithStrava}>
            <Image
              source={ require("../../assets/images/btn_strava_connectwith_orange.png")}
              className="w-[196px] h-[48px]"
              alt="Connect with Strava"
            />
          </Pressable> */}
        </VStack>

        <HStack className="self-center" space="sm">
          <Text size="md">Don&apos;t have an account?</Text>
          <Link onPress={() => router.replace("/(sign-in-sign-up)/sign-up")}>
            <LinkText
              className="font-medium text-primary-700 group-hover/link:text-primary-600  group-hover/pressed:text-primary-700"
              size="md"
            >
              Sign up
            </LinkText>
          </Link>
        </HStack>
        <Text> </Text>
        <HStack className="self-center" space="sm">
          <Link isExternal={true} href="https://www.gig-booker.com">
            <LinkText className="font-medium text-primary-700 group-hover/link:text-primary-600  group-hover/pressed:text-primary-700">Who we are</LinkText>
          </Link>
        </HStack>
      </VStack>
    </VStack>
    </BaseScrollLayout>
  );
}
