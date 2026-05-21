import { tabBarIconSize } from "@/common/constants";
import { Tabs } from "expo-router";
import { KeyRoundIcon, NotebookTabsIcon, UserIcon } from "lucide-react-native";

export default function Layout() {
  return (
    <Tabs initialRouteName="profile">
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: (props) => <UserIcon size={tabBarIconSize} color={props.color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: (props) => <NotebookTabsIcon size={tabBarIconSize} color={props.color} />,
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
          title: 'Change Password',
          tabBarIcon: (props) => <KeyRoundIcon size={tabBarIconSize} color={props.color} />,
        }}
      />
      </Tabs>
  );
}
