import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack initialRouteName="venues">
      <Stack.Screen name="venues" options={{ title: 'Venues' }} />
      <Stack.Screen name="favorites" options={{ title: 'Favorite Venues' }} />
    </Stack>
  );
}
