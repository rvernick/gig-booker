import { tabBarIconSize } from "@/common/constants";
import { Tabs } from "expo-router";
import {
  LogInIcon,
  UserPlusIcon,
  MailCheckIcon,
  BriefcaseMedicalIcon,
  FileKeyIcon,
} from "lucide-react-native"

export default function SignInSignUp() {

  return (
    <Tabs initialRouteName="(sign-in)">
      <Tabs.Screen
        name="(sign-in)"
        options={{
          title: "Sign In",
          href: "/sign-in",
          headerShown: false,
          freezeOnBlur: true,
          tabBarIcon: ({ color }) => (
            <LogInIcon size={tabBarIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sign-up"
        options={{
          title: "Sign Up",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <UserPlusIcon size={tabBarIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <BriefcaseMedicalIcon size={tabBarIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="privacy-policy"
        options={{
          title: "Privacy",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <FileKeyIcon size={tabBarIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wait-for-verification"
        options={{
          href: null,
          title: "Waiting",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MailCheckIcon size={tabBarIconSize} color={color}/>
          ),
        }}
      />
    </Tabs>
  );
}