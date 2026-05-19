import { router } from "expo-router";
import { BaseScrollLayout } from "@/components/layouts/base-scroll-layout";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Link, LinkText } from "@/components/ui/link";

export default function Index() {

  const signIn = () => { router.replace("/(sign-in-sign-up)/(sign-in)/sign-in-with-email") };

  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <Heading className="text-center" size="3xl">
            Gig Booker Privacy
          </Heading>
          <Text className="text-center">Gig Booker does its best to maintain your data securly and privately</Text>
          <Text className="text-center">We track your use of the app to better support you.  We use the data for customer support and to know how best to update the experience.</Text>
          <Text className="text-center">We DO NOT sell this data nor do we use it for advertising.</Text>
          <Text className="text-center">Our privacy policy is evolving.  We will notify you when it changes.</Text>
          <Text className="text-center">If you have questions, contact: info@gig-booker.com</Text>

          <Text> </Text>
          <Text> </Text>
          <Button action="primary" onPress={signIn} accessibilityLabel="Get Started" accessibilityHint="Sign In">
            <ButtonText>Get Started</ButtonText>
          </Button>
          <Link isExternal={true} href="https://www.gig-booker.com">
            <LinkText className="font-medium text-primary-700 group-hover/link:text-primary-600  group-hover/pressed:text-primary-700">Who we are</LinkText>
          </Link>
        </VStack>
      </VStack>
    </BaseScrollLayout>
  );
}
