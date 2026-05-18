import { Stack } from "expo-router";

export default function Layout() {

  return (
    <Stack initialRouteName="sign-in-with-email">
      <Stack.Screen name="sign-in" options={{
          title: "Sign In",
          headerShown: false,
          freezeOnBlur: true,
        }} />
      <Stack.Screen name="sign-in-with-email" options={{
          title: "Sign In",
          headerShown: false,
        }} />
      <Stack.Screen name="password-reset" options={{
        title: 'Password Reset',
      }} />
      <Stack.Screen name="new-password-on-reset" options={{
        title: 'Password Reset',
        headerShown: false,
      }} />
    </Stack>
  );
}
