import { tabBarIconSize } from "@/common/constants";
import { Tabs } from "expo-router";
import { CalendarArrowUpIcon, CalendarSyncIcon } from "lucide-react-native";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarPosition: "top", headerShown: false }}>
      <Tabs.Screen name="index" options={{
        title: "Upcoming",
        tabBarIcon: ({ color }) => (
            <CalendarArrowUpIcon size={tabBarIconSize} color={color}/>
          )
      }}/>
      <Tabs.Screen name="recurring" options={{
        title: "Recurring",
        tabBarIcon: ({ color }) => (
            <CalendarSyncIcon size={tabBarIconSize} color={color}/>
          )
      }}/>
    </Tabs>
  );
}
