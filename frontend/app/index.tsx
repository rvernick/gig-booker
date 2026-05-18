import { isMobile } from "@/common/utils";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { Image } from "react-native";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Pressable } from "@/components/ui/pressable";
import { Link, LinkText } from "@/components/ui/link";

export default function Index() {
  // const session = useSession();

  // const skipIfLoggedIn = async () => {
  //   await sleep(1);
  //   const forward = await isLoggedIn(session);
  //   if (forward) {
  //     router.replace('/logged-in');
  //   }
  // }

  // useEffect(() => {
  //   skipIfLoggedIn();
  // }, []);

  const goToSignIn = () => { router.replace('/(sign-in-sign-up)/(sign-in)/sign-in-with-email') };
  const appStoreURL = "https://apps.apple.com/us/app/cup-of-sugar/";  // TODO: replace with actual app store URL

  return (
    <BaseLayout>
      <Icon></Icon>
      <Image
        source={{
          uri: 'https://apps.apple.com/us/app/pedal-assistant/id6680175112?itscg=30200&itsct=apps_box_badge&mttnsubad=6680175112',
        }}
        />
      <VStack className="max-w-[440px] w-full" space="md">
        <VStack className="md:items-center" space="md">
          <VStack>
            <Heading className="text-center" size="3xl">
              Cup of Sugar
            </Heading>
            <Text className="text-center"> </Text>
            <Text className="text-center"></Text>
            <Text className="text-center">Neighbors helping each other at the click of a button</Text>
            <Text className="text-center">Asking for help shouldn&apos;t be hard</Text>
            <Text> </Text>
          </VStack>
        </VStack>
        <Button className="bottom-button shadow-md rounded-lg m-1" onPress={goToSignIn}>
          <ButtonText>Get Started</ButtonText>
        </Button>
        <VStack className="md:items-center">
          {/* <Image className="centered" source={require("../assets/images/api_logo_pwrd_by_strava_stack_light.png")}/> */}
          { isMobile() ? null : (
            <Pressable style={{ width: 246, height: 82}}
                onPress={() => window.open(appStoreURL)}>
              <Image className="absolute top-0 right-0"
                source={{
                  uri: 'https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1728691200',              }}
                style={{ width: 246, height: 82}}
              />
            </Pressable>
          )}
          <Text> </Text>
          <Link isExternal={true} href="https://www.cup-of-sugar.com">
            <LinkText size="lg">Who we are</LinkText>
          </Link>
        </VStack>
      </VStack>
    </BaseLayout>
  );
}
