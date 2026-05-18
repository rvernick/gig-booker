import { useSession } from "@/common/ctx";
import { flagPhoto, getPhoto } from "@/common/data-utils";
import { ensureNumber, ensureString } from "@/common/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { FlagIcon } from "lucide-react-native";
import { Icon } from "../ui/icon";
import { Pressable } from "../ui/pressable";
import { HStack } from "../ui/hstack";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "../ui/alert-dialog";
import { Heading } from "../ui/heading";
import { VStack } from "../ui/vstack";
import { Button, ButtonText } from "../ui/button";
import { Text } from "../ui/text";
import { Input, InputField } from "../ui/input";

export interface CoSAvatarComponentProps {
  photoId?: number;
  fallbackText: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
}

const CoSAvatarComponent: React.FC<CoSAvatarComponentProps> = ({ photoId, fallbackText, size='md'  }) => {
  const [image, setImage] = useState<string>('');
  const [flagOpen, setFlagOpen] = useState(false);

  const session = useSession();
  const queryClient = useQueryClient();

  const syncPhoto = async () => {
    if (!photoId) return;
    const photo = await getPhoto(queryClient, session, photoId, ensureString(session.username));
    if (photo?.presignedURL) {
      setImage(photo.presignedURL);
    }
  }

  useEffect(() => {
    syncPhoto();
  }, [photoId]);

  interface FlagPhotoProps {
    id: number;
    open: boolean;
    close: () => void;
  }

  const FlagPhotoDialog: React.FC<FlagPhotoProps> = ({ id, open, close }) => {
    const [reason, setReason] = useState('');

    const handleFlag = () => {
      flagPhoto(session, id, reason);
      close();
    };

    return (
      <AlertDialog isOpen={open} onClose={close}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Flag Photo</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <VStack className="space-y-4">
              <Text className="text-typography-700">
                Why do you want to flag this photo?
              </Text>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
              >
                <InputField
                  value={reason}
                  onChangeText={setReason}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="reasonInput"
                  accessibilityLabel="Reason Input"
                  accessibilityHint="Reason for flagging the photo"
                  placeholder="Enter reason here..."
                />
              </Input>
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter className="flex-row space-x-3">
            <Button variant="outline" action="secondary" onPress={() => close()}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button action="positive" onPress={handleFlag}>
              <ButtonText>Confirm</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <HStack className="justify-start">
      <FlagPhotoDialog id={ensureNumber(photoId)} open={flagOpen} close={() => setFlagOpen(false)} />
      <Avatar size={size} className="bg-blue-500">
        <AvatarFallbackText>{fallbackText}</AvatarFallbackText>
        {image ? (
          <AvatarImage source={{ uri: image }} />
        ) : null}
      </Avatar>
      {image && (
        <Pressable className="justify-items-start" onPress={() => setFlagOpen(true)}>
          <Icon as={FlagIcon} size='2xs'/>
        </Pressable>
      )}
    </HStack>
  );
}

export default CoSAvatarComponent;
