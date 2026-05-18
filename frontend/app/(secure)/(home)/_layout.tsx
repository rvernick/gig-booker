import { Tabs } from "expo-router";
import { isMobileSize } from "@/common/utils";
import {
  SettingsIcon,
  LogOutIcon,
  CrossIcon,
} from "lucide-react-native"
import { tabBarIconSize } from "@/common/constants";

export default function TabLayout() {
  return (
    <Tabs initialRouteName="(help-requests)">
      <Tabs.Screen
        name="(help-requests)"
        options={{
          title: "Help",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <CrossIcon size={tabBarIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SettingsIcon size={tabBarIconSize} color={color} />
          ),
        }}
      />
      {isMobileSize() ? (
        <Tabs.Screen
          name="sign-out"
          options={{
            href: null,
            title: "Sign Out",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <LogOutIcon size={tabBarIconSize} color={color} />
            ),
          }}
        />) : (
        <Tabs.Screen
          name="sign-out"
          options={{
            title: "Sign Out",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <LogOutIcon size={tabBarIconSize} color={color} />
            ),
          }}
        />
        )}
    </Tabs>
  );
}