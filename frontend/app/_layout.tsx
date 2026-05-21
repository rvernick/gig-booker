import { Stack } from 'expo-router';
import { SessionProvider, useSession } from "@/common/ctx";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import "@/global.css";

import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GlobalStateProvider } from '@/common/GlobalContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'react-native-error-boundary';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useEffect, useState } from 'react';
import { devLog } from '@/common/utils';
import { NotificationProvider } from '@/common/NotificationContext';

const onError = (error: Error, stackTrace: string) => {
  console.log('Error boundaries caught an error:', error);
  console.error(error, stackTrace);
};

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const colorScheme = systemColorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const queryClient = new QueryClient();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary onError={onError}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <NotificationProvider>
              <GlobalStateProvider>
                <ThemeProvider value={colorScheme} >
                  <GluestackUIProvider mode={systemColorScheme === 'dark' ? 'dark' : 'light'}>
                    <RootNavigator />
                  </GluestackUIProvider>
                </ThemeProvider>
              </GlobalStateProvider>
            </NotificationProvider>
          </SessionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const session = useSession();
  const [validLogin, setValidLogin] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    devLog("Checking session:", session);
    if (session.jwt_token && session.jwt_token.length > 0) {
      setValidLogin(true);
      setFailedAttempts(0);
      devLog("Valid login");
      return;
    }
    if (failedAttempts >= 5) {
      devLog("Too many failed attempts, logging out");
      setValidLogin(false);
    } else {
      devLog("failed login attempt. Attempts: ", failedAttempts);
      setFailedAttempts(failedAttempts + 1);
    }
  });

  return (
    <Stack initialRouteName='index'>
      <Stack.Protected guard={validLogin}>
        <Stack.Screen name="(secure)" options={ {headerShown: false}} />
      </Stack.Protected>

      <Stack.Screen name="(sign-in-sign-up)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="logging-in" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}