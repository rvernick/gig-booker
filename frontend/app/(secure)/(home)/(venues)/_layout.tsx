import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ title: "Venues", headerShown: false }} />
      <Stack.Screen name="[venueId]" options={{ title: "Venue" }} />
    </Stack>
  );
}

