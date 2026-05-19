import React from "react";
import { router } from "expo-router";
import { useSession } from "@/common/ctx";
import { BaseScrollLayout } from "@/components/layouts/base-scroll-layout";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Link, LinkText } from "@/components/ui/link";

export const LoginComponent = () => {
  const session = useSession();

  // const isLoggedIn = () => {
  //   return session.jwt_token && session.jwt_token.length > 0;
  // }

  const goToLoginWithEmail = () => {
    router.replace('/(sign-in-sign-up)/(sign-in)/sign-in-with-email');
  }

  // const goToHomeIfHasJWT = (force: boolean = false) => {
  //   if (isLoggedIn()) {
  //     router.replace({
  //       pathname: '/logging-in',
  //       params: { jwt_token: session.jwt_token },
  //     });
  //   } else if (force) {
  //     router.replace('/logging-in');
  //   } else {
  //     console.log('No JWT token found, redirecting to home');
  //   }
  // }

  return (
    <BaseScrollLayout>
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <VStack>
            <Heading className="md:text-center" size="3xl">
              Log in
            </Heading>
            <Text>Login to Gig Booker</Text>
          </VStack>
        </VStack>
      <VStack className="w-full">
        <HStack className="self-center" space="sm">
          <Link onPress={goToLoginWithEmail}>
            <LinkText
              className="font-medium text-primary-700 group-hover/link:text-primary-600  group-hover/pressed:text-primary-700"
              size="md"
            >
              Login with email
            </LinkText>
          </Link>
        </HStack>
      </VStack>
    </VStack>
    </BaseScrollLayout>
  );
}
