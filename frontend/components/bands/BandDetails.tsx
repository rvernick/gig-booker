import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { BaseScrollLayout } from "@/components/layouts/base-scroll-layout";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/common/ctx";
import {
  addBandMember,
  allUsers,
  fetchBandById,
  fetchBandMembers,
  getPhoto,
  removeBandMember,
  uploadBandPhoto,
  upsertBand,
} from "@/common/data-utils";
import { ensureString, preprocessFile } from "@/common/utils";
import { threeMB } from "@/common/constants";
import * as ImagePicker from "expo-image-picker";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import type { Band } from "@/models/Band";
import type { BandMember } from "@/models/BandMember";
import type { User } from "@/models/User";

type BandDetailsProps = {
  bandId: number;
};

export const BandDetails: React.FC<BandDetailsProps> = ( {bandId}) => {
  const session = useSession();
  const username = ensureString(session.username);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [id, setId] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [photoId, setPhotoId] = useState<number | null>(null);
  const [createdOn, setCreatedOn] = useState<string | undefined>(undefined);
  const [updatedOn, setUpdatedOn] = useState<string | undefined>(undefined);

  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [bandPhotoUrl, setBandPhotoUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [members, setMembers] = useState<BandMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const isNew = bandId === 0;

  useEffect(() => {
    let cancelled = false;

    const setFromBand = (band: Band | null) => {
      if (!band) return;
      setId(band.id ?? 0);
      setName(band.name ?? "");
      setPhotoId(band.photoId ?? null);
      setCreatedOn(band.createdOn);
      setUpdatedOn(band.updatedOn);
    };

    const reset = () => {
      setId(0);
      setName("");
      setPhotoId(null);
      setCreatedOn(undefined);
      setUpdatedOn(undefined);
    };

    const load = async () => {
      setErrorMessage(null);

      if (isNew) {
        reset();
        return;
      }

      setIsFetching(true);
      try {
        const band = await fetchBandById(session, username, bandId);
        if (cancelled) return;
        if (!band) {
          setErrorMessage("Band not found.");
          return;
        }
        setFromBand(band);
      } catch (e: any) {
        if (cancelled) return;
        setErrorMessage(e?.message ?? "Failed to load band.");
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isNew, bandId, session, username]);

  useEffect(() => {
    let cancelled = false;

    const loadPhotoUrl = async () => {
      if (!photoId || photoId <= 0) {
        setBandPhotoUrl("");
        return;
      }
      try {
        const photo = await getPhoto(queryClient, session, photoId, username);
        if (cancelled) return;
        setBandPhotoUrl(ensureString(photo?.presignedURL));
      } catch {
        if (!cancelled) setBandPhotoUrl("");
      }
    };

    loadPhotoUrl();
    return () => {
      cancelled = true;
    };
  }, [photoId, queryClient, session, username]);

  useEffect(() => {
    let cancelled = false;

    const loadMembers = async () => {
      if (isNew || id <= 0) {
        setMembers([]);
        return;
      }
      setIsLoadingMembers(true);
      try {
        const roster = await fetchBandMembers(session, username, id);
        if (!cancelled) setMembers(roster ?? []);
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setIsLoadingMembers(false);
      }
    };

    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [id, isNew, session, username]);

  const title = useMemo(() => (isNew ? "New Band" : name || "Band"), [isNew, name]);

  const canSave = name.trim().length > 0 && !isSaving;

  const currentUsername = ensureString(session.username).toLowerCase();

  const openMemberPicker = async () => {
    setUserSearch("");
    setIsMemberPickerOpen(true);
    if (availableUsers.length > 0) return;

    setIsLoadingUsers(true);
    try {
      const users = await allUsers(session, username);
      setAvailableUsers((users ?? []) as User[]);
    } catch {
      setAvailableUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    const existing = new Set(members.map((m) => (m.username ?? "").toLowerCase()));
    return (availableUsers ?? [])
      .filter((u) => !!u?.username)
      .filter((u) => !existing.has(u.username.toLowerCase()))
      .filter((u) => {
        if (q.length === 0) return true;
        const hay = `${u.username} ${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 30);
  }, [availableUsers, members, userSearch]);

  const doAddMember = async (memberUsername: string) => {
    if (id <= 0) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await addBandMember(session, username, id, memberUsername);
      const roster = await fetchBandMembers(session, username, id);
      setMembers(roster ?? []);
      setIsMemberPickerOpen(false);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Failed to add member.");
    } finally {
      setIsSaving(false);
    }
  };

  const doRemoveMember = async (memberUsername: string) => {
    if (id <= 0) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await removeBandMember(session, username, id, memberUsername);
      const roster = await fetchBandMembers(session, username, id);
      setMembers(roster ?? []);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Failed to remove member.");
    } finally {
      setIsSaving(false);
    }
  };

  const onSave = async () => {
    if (!canSave) return;
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const saved = await upsertBand(session, username, {
        id,
        name,
        photoId,
        createdOn,
        updatedOn,
      });
      if (!saved) {
        setErrorMessage("Save failed.");
        return;
      }

      setId(saved.id ?? 0);
      setName(saved.name ?? "");
      setPhotoId(saved.photoId ?? null);
      setCreatedOn(saved.createdOn);
      setUpdatedOn(saved.updatedOn);
      await queryClient.invalidateQueries({ queryKey: ["bands", username] });
      await queryClient.invalidateQueries({ queryKey: ["band", username, String(saved.id)] });

      if (isNew) {
        router.replace(`/(secure)/(home)/(bands)/${saved.id}` as any);
      }
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const pickBandPhoto = async () => {
    if (id <= 0 || isSaving || isUploadingPhoto) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setErrorMessage("Photo library access is required to upload a band photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: false,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const processed = await preprocessFile(asset);
    if (!processed) {
      setErrorMessage("Could not process the selected image.");
      return;
    }

    const size = (processed as File).size ?? (processed as { size?: number }).size ?? 0;
    if (size > threeMB) {
      setErrorMessage("Image is too large. Try a smaller photo.");
      return;
    }

    setErrorMessage(null);
    setIsUploadingPhoto(true);
    try {
      const updated = await uploadBandPhoto(session, username, id, processed as File);
      setPhotoId(updated.photoId ?? null);
      if (updated.photoId) {
        queryClient.removeQueries({ queryKey: ["photo", ensureString(updated.photoId)] });
      }
      await queryClient.invalidateQueries({ queryKey: ["bands", username] });
      await queryClient.invalidateQueries({ queryKey: ["band", username, String(updated.id)] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setErrorMessage(msg);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <BaseScrollLayout>
      <VStack className="gap-4 w-full">
        <Heading size="xl">{title}</Heading>
        <Text className="text-typography-600">
          {isNew ? "Create a new band." : `Band ID: ${id}`}
        </Text>

        {(isFetching || isSaving) && !isUploadingPhoto && (
          <Box className="py-2">
            <Spinner size="large" />
          </Box>
        )}

        {errorMessage ? (
          <Box className="bg-error-50 p-3 rounded-md">
            <Text className="text-error-700">{errorMessage}</Text>
          </Box>
        ) : null}

        <VStack className="gap-2">
          <Text className="text-typography-700">Name</Text>
          <Input>
            <InputField
              value={name}
              placeholder="Band name"
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
              editable={!isSaving}
            />
          </Input>
        </VStack>

        <VStack className="gap-2">
          <Text className="text-typography-700">Band photo</Text>
          {isNew || id <= 0 ? (
            <Text className="text-typography-600">
              Save the band first, then you can add a photo.
            </Text>
          ) : (
            <HStack className="items-center gap-4">
              <Pressable
                onPress={pickBandPhoto}
                accessibilityLabel="Band photo"
                accessibilityHint="Choose a photo for this band"
                disabled={isSaving || isUploadingPhoto}
              >
                <Avatar size="lg" className="bg-typography-200">
                  <AvatarFallbackText>{name.trim().slice(0, 2).toUpperCase() || "♪"}</AvatarFallbackText>
                  {bandPhotoUrl ? (
                    <AvatarImage source={{ uri: bandPhotoUrl }} />
                  ) : null}
                </Avatar>
              </Pressable>
              <VStack className="flex-1 gap-1">
                <Button
                  variant="outline"
                  onPress={pickBandPhoto}
                  isDisabled={isSaving || isUploadingPhoto}
                >
                  <ButtonText>{photoId ? "Change photo" : "Upload photo"}</ButtonText>
                </Button>
                {isUploadingPhoto ? <Spinner size="small" /> : null}
                <Text className="text-typography-600 text-sm">
                  Band admins can upload a square image; previous photos are replaced.
                </Text>
              </VStack>
            </HStack>
          )}
        </VStack>

        {!isNew && id > 0 ? (
          <VStack className="gap-2">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700">Members</Text>
              <Button variant="outline" onPress={openMemberPicker} isDisabled={isSaving}>
                <ButtonText>Add Member</ButtonText>
              </Button>
            </HStack>

            {isLoadingMembers ? (
              <Spinner size="large" />
            ) : members.length === 0 ? (
              <Text className="text-typography-600">No members found.</Text>
            ) : (
              <VStack className="gap-2">
                {members.map((m) => {
                  const isSelf = (m.username ?? "").toLowerCase() === currentUsername;
                  return (
                    <HStack key={`${m.userId}-${m.username}`} className="items-center justify-between">
                      <VStack>
                        <Text className="text-typography-900" style={{ fontWeight: "600" }}>
                          {m.firstName || m.lastName
                            ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
                            : m.username}
                        </Text>
                        <Text className="text-typography-600">@{m.username}</Text>
                        {m.permissions?.length ? (
                          <Text className="text-typography-600">
                            Permissions: {m.permissions.join(", ")}
                          </Text>
                        ) : null}
                      </VStack>

                      {!isSelf ? (
                        <Button
                          variant="outline"
                          onPress={() => doRemoveMember(m.username)}
                          isDisabled={isSaving}
                        >
                          <ButtonText>Remove</ButtonText>
                        </Button>
                      ) : (
                        <Text className="text-typography-600">You</Text>
                      )}
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </VStack>
        ) : null}

        <HStack className="gap-2 pt-2">
          <Button onPress={onSave} isDisabled={!canSave}>
            <ButtonText>{isNew ? "Create" : "Save"}</ButtonText>
          </Button>
          <Button
            variant="outline"
            onPress={() => router.back()}
            isDisabled={isSaving}
          >
            <ButtonText>Back</ButtonText>
          </Button>
        </HStack>

        <AlertDialog isOpen={isMemberPickerOpen} onClose={() => setIsMemberPickerOpen(false)}>
          <AlertDialogBackdrop />
          <AlertDialogContent>
            <AlertDialogHeader className="justify-between">
              <Heading size="md">Add band member</Heading>
              <AlertDialogCloseButton />
            </AlertDialogHeader>
            <AlertDialogBody>
              <VStack className="gap-3">
                <Input>
                  <InputField
                    value={userSearch}
                    placeholder="Search users…"
                    onChangeText={setUserSearch}
                    autoCapitalize="none"
                  />
                </Input>

                {isLoadingUsers ? (
                  <Spinner size="large" />
                ) : filteredUsers.length === 0 ? (
                  <Text className="text-typography-600">No matching users.</Text>
                ) : (
                  <VStack className="gap-2">
                    {filteredUsers.map((u) => (
                      <Pressable
                        key={u.username}
                        accessibilityRole="button"
                        onPress={() => doAddMember(u.username)}
                        style={{ paddingVertical: 10 }}
                      >
                        <Text className="text-typography-900" style={{ fontWeight: "600" }}>
                          {u.firstName || u.lastName
                            ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                            : u.username}
                        </Text>
                        <Text className="text-typography-600">@{u.username}</Text>
                      </Pressable>
                    ))}
                  </VStack>
                )}
              </VStack>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button variant="outline" onPress={() => setIsMemberPickerOpen(false)}>
                <ButtonText>Close</ButtonText>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </VStack>
    </BaseScrollLayout>
  );
}

