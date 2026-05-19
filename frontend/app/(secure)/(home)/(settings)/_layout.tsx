import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="contacts" options={{ title: "Contacts" }} />
      <Stack.Screen
        name="change-password"
        options={{ title: "Password" }}
      />
    </Stack>
  );
}
