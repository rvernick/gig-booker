import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack initialRouteName="email">
      <Stack.Screen
        name="email"
        options={{
          title: 'Email',
        }}/>
      <Stack.Screen
        name="emailVerify"
        options={{
          title: 'Email Verification',
        }}/>
      <Stack.Screen
        name="address"
        options={{
          title: 'Home Address',
        }}/>
      <Stack.Screen
        name="name-and-phone"
        options={{
          title: 'Personal Info',
        }}/>
    </Stack>
  );
}
