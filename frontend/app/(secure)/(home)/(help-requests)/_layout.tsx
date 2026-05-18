import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack initialRouteName="requests">
      <Stack.Screen
        name="requests"
        options={{
          title: 'Requests',
        }}/>
      <Stack.Screen
        name="request"
        options={{
          title: 'Request',
        }}/>
    </Stack>
  );
}
