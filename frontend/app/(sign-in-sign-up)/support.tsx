import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Link, LinkText } from "@/components/ui/link";

export default function Index() {
  const signIn = () => { router.replace("/(sign-in-sign-up)/(sign-in)/sign-in-with-email") };

  return (
    <BaseLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <Heading className="text-center" size="3xl">
            Cup of Sugar Support
          </Heading>
          <Text className="text-center">Cup of Sugar wants you to have the best experience possible</Text>
          <Text className="text-center">If you need any help, contact: info@cup-of-sugar.com</Text>
          <Text> </Text>
          <Text> </Text>
          <Button action="primary" onPress={signIn} accessibilityLabel="Get Started" accessibilityHint="Sign In">
            <ButtonText>Get Started</ButtonText>
          </Button>
          <Link isExternal={true} href="https://www.cup-of-sugar.com">
            <LinkText className="font-medium text-primary-700 group-hover/link:text-primary-600  group-hover/pressed:text-primary-700">Who we are</LinkText>
          </Link>

        </VStack>
      </VStack>
    </BaseLayout>
  );
}
