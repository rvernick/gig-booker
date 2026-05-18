import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
        }}
      />
      <Drawer.Screen
        name="change-password"
        options={{
          drawerLabel: 'Password',
          title: 'Password',
        }}
      />
    </Drawer>
  );
}
