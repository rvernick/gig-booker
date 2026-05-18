import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack initialRouteName="(home)">
      <Stack.Screen
        name="(home)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(onboarding)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
