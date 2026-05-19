import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ title: "Bands", headerShown: false,}} />
      <Stack.Screen name="[bandId]" options={{ title: "Band", headerShown: false }} />
    </Stack>
  );
}

