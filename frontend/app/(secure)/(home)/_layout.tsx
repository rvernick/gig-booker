import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItem,
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
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react-native";
import { tabBarIconSize } from "@/common/constants";

const SETTINGS_SUB_ROUTES = ["profile", "contacts", "change-password"] as const;

function isSettingsPath(pathname: string): boolean {
  return SETTINGS_SUB_ROUTES.some((sub) => pathname.endsWith(`/${sub}`));
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mobile = isMobileSize();

  const inSettings = isSettingsPath(pathname);
  const [settingsOpen, setSettingsOpen] = useState(inSettings);
  const showSettingsChildren = settingsOpen || inSettings;

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Gigs"
        focused={pathname.includes("/(gigs)") || pathname.includes("/gigs")}
        icon={({ color }) => (
          <CalendarIcon size={tabBarIconSize} color={color} />
        )}
        onPress={() => router.push("/(secure)/(home)/(gigs)" as any)}
      />
      <DrawerItem
        label="Bands"
        focused={pathname.includes("/(bands)") || pathname.includes("/bands")}
        icon={({ color }) => (
          <MusicIcon size={tabBarIconSize} color={color} />
        )}
        onPress={() => router.push("/(secure)/(home)/(bands)" as any)}
      />
      <DrawerItem
        label="Venues"
        focused={pathname.includes("/(venues)") || pathname.includes("/venues")}
        icon={({ color }) => (
          <MapPinIcon size={tabBarIconSize} color={color} />
        )}
        onPress={() => router.push("/(secure)/(home)/(venues)" as any)}
      />
      <DrawerItem
        label={({ color }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Text style={{ color, flex: 1, fontWeight: "500" }}>Settings</Text>
            {showSettingsChildren ? (
              <ChevronDownIcon size={16} color={color} />
            ) : (
              <ChevronRightIcon size={16} color={color} />
            )}
          </View>
        )}
        focused={inSettings && !showSettingsChildren}
        icon={({ color }) => (
          <SettingsIcon size={tabBarIconSize} color={color} />
        )}
        onPress={() => setSettingsOpen((prev) => !prev)}
      />

      {showSettingsChildren && (
        <View style={{ paddingLeft: 24 }}>
          <DrawerItem
            label="Profile"
            focused={pathname.endsWith("/profile")}
            onPress={() =>
              router.push("/(secure)/(home)/(settings)/profile" as any)
            }
          />
          <DrawerItem
            label="Contacts"
            focused={pathname.endsWith("/contacts")}
            onPress={() =>
              router.push("/(secure)/(home)/(settings)/contacts" as any)
            }
          />
          <DrawerItem
            label="Password"
            focused={pathname.endsWith("/change-password")}
            onPress={() =>
              router.push(
                "/(secure)/(home)/(settings)/change-password" as any,
              )
            }
          />
        </View>
      )}

      {!mobile && (
        <DrawerItem
          label="Sign Out"
          focused={pathname.endsWith("/sign-out")}
          icon={({ color }) => (
            <LogOutIcon size={tabBarIconSize} color={color} />
          )}
          onPress={() => router.push("/(secure)/(home)/sign-out" as any)}
        />
      )}
    </DrawerContentScrollView>
  );
}

