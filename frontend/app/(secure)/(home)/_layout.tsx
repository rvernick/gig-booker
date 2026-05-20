import { useState } from "react";
import { Drawer } from "expo-router/drawer";
import {
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useRouter, usePathname } from "expo-router";
import { isMobileSize } from "@/common/utils";
import {
  SettingsIcon,
  LogOutIcon,
  MusicIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react-native";
import { tabBarIconSize } from "@/common/constants";

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <Drawer>
      <Drawer.Screen
        name='(gigs)'
        options={{
          drawerLabel: 'Gigs',
          title: 'Gigs',
          drawerIcon: (props) => <CalendarIcon size={tabBarIconSize} color={props.color} />,
        }}
      />
      <Drawer.Screen
        name='(bands)'
        options={{
          drawerLabel: 'Bands',
          title: 'Bands',
          drawerIcon: (props) => <MusicIcon size={tabBarIconSize} color={props.color} />,
        }}
      />
      <Drawer.Screen
        name='(venues)'
        options={{
          drawerLabel: 'Venues',
          title: 'Venues',
          drawerIcon: (props) => <MapPinIcon size={tabBarIconSize} color={props.color} />,
        }}
      />
      <Drawer.Screen
        name='(settings)'
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
          drawerIcon: (props) => <SettingsIcon size={tabBarIconSize} color={props.color} />,
        }}
      />
      <Drawer.Screen
        name='sign-out'
        options={{
          drawerLabel: 'Logout',
          title: 'Logout',
          drawerIcon: (props) => <LogOutIcon size={tabBarIconSize} color={props.color} />,
        }}
      />
    </Drawer>
  );
}
