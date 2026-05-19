import React, { useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import type { Place } from "react-native-google-places-textinput";

import { BaseScrollLayout } from "@/components/layouts/base-scroll-layout";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Dropdown } from "@/components/common/Dropdown";
import { PlacesTextInput } from "@/components/common/PlacesTextInput";
import { BookingInstructionsEditor } from "@/components/venues/BookingInstructionsEditor";

import { useSession } from "@/common/ctx";
import { ensureString, isDevelopment } from "@/common/utils";
import { fetchVenueById, upsertVenue } from "@/common/data-utils";
import type { CoSLocation } from "@/models/CoSLocation";
import { prLocationFrom } from "@/models/CoSLocation";
import type { Venue, VenueSize } from "@/models/Venue";

type Props = {
  venueId: number;
};

type Tab = "general" | "booking";

const sizeOptions: { label: string; value: VenueSize }[] = [
  { label: "Micro", value: "micro" },
  { label: "Small", value: "small" },
  { label: "Mid-sized", value: "mid-sized" },
  { label: "Arena", value: "arena" },
  { label: "Stadium", value: "stadium" },
];

const musicTypesToText = (types: string[]) => (types ?? []).join(", ");
const textToMusicTypes = (text: string) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

export function VenueDetails(props: Props) {
  const session = useSession();
  const username = ensureString(session.username);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [id, setId] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<CoSLocation | null>(null);
  const [locationText, setLocationText] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [bookingContact, setBookingContact] = useState<string>("");
  const [size, setSize] = useState<VenueSize>("small");
  const [musicTypesText, setMusicTypesText] = useState<string>("");
  const [createdOn, setCreatedOn] = useState<string | undefined>(undefined);
  const [updatedOn, setUpdatedOn] = useState<string | undefined>(undefined);

  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isNew = props.venueId === 0;

  const title = useMemo(
    () => (isNew ? "New Venue" : locationText || name || "Venue"),
    [isNew, locationText, name],
  );

  const canSave = !isSaving && (location != null || !isNew);

  useEffect(() => {
    let cancelled = false;

    const reset = () => {
      setId(0);
      setName("");
      setLocation(null);
      setLocationText("");
      setWebsite("");
      setBookingContact("");
      setSize("small");
      setMusicTypesText("");
      setCreatedOn(undefined);
      setUpdatedOn(undefined);
    };

    const setFromVenue = (venue: Venue) => {
      setId(venue.id ?? 0);
      setName(venue.name ?? "");
      setLocation(venue.location ?? null);
      setLocationText(
        venue.location?.formattedAddress ?? venue.location?.displayName ?? "",
      );
      setWebsite(venue.website ?? "");
      setBookingContact(venue.bookingContact ?? "");
      setSize((venue.size as VenueSize) ?? "small");
      setMusicTypesText(musicTypesToText(venue.musicTypes ?? []));
      setCreatedOn(venue.createdOn);
      setUpdatedOn(venue.updatedOn);
    };

    const load = async () => {
      setErrorMessage(null);
      if (isNew) {
        reset();
        return;
      }

      setIsFetching(true);
      try {
        const venue = await fetchVenueById(session, username, props.venueId);
        if (cancelled) return;
        if (!venue) {
          setErrorMessage("Venue not found.");
          return;
        }
        setFromVenue(venue);
      } catch (e: any) {
        if (cancelled) return;
        setErrorMessage(e?.message ?? "Failed to load venue.");
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isNew, props.venueId, session, username]);

  const handlePlaceSelect = (place: Place) => {
    const loc = prLocationFrom(place);
    if (loc) {
      setLocation(loc);
      setLocationText(loc.formattedAddress || loc.displayName || "");
      if (name.trim().length === 0) {
        setName(loc.displayName || "");
      }
    }
  };

  const handlePlaceSelectError = (error: Error) => {
    setErrorMessage(error.message || "Failed to fetch address");
  };

  const onSave = async () => {
    if (!canSave) return;
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const saved = await upsertVenue(session, username, {
        id,
        name: name.trim().length ? name.trim() : null,
        location,
        website: website.trim().length ? website.trim() : null,
        bookingContact: bookingContact.trim().length ? bookingContact.trim() : null,
        size,
        musicTypes: textToMusicTypes(musicTypesText),
        createdOn,
        updatedOn,
      });

      if (!saved) {
        setErrorMessage("Save failed.");
        return;
      }

      setId(saved.id ?? 0);
      setName(saved.name ?? "");
      setLocation(saved.location ?? null);
      setLocationText(
        saved.location?.formattedAddress ?? saved.location?.displayName ?? "",
      );
      setWebsite(saved.website ?? "");
      setBookingContact(saved.bookingContact ?? "");
      setSize((saved.size as VenueSize) ?? "small");
      setMusicTypesText(musicTypesToText(saved.musicTypes ?? []));
      setCreatedOn(saved.createdOn);
      setUpdatedOn(saved.updatedOn);

      await queryClient.refetchQueries({ queryKey: ["venues", username] });

      if (isNew) {
        router.replace(`/(secure)/(home)/(venues)/${saved.id}` as any);
      }
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseScrollLayout>
      <VStack className="gap-4 w-full">
        <Heading size="xl">{title}</Heading>
        {isDevelopment() && (
          <Text className="text-typography-600">
            {isNew ? "Create a new venue." : `Venue ID: ${id}`}
          </Text>
        )}

        {(isFetching || isSaving) && (
          <Box className="py-2">
            <Spinner size="large" />
          </Box>
        )}

        {errorMessage ? (
          <Box className="bg-error-50 p-3 rounded-md">
            <Text className="text-error-700">{errorMessage}</Text>
          </Box>
        ) : null}

        {/* Tab bar — only shown for existing venues */}
        {!isNew && (
          <HStack className="border-b border-background-300">
            {(["general", "booking"] as Tab[]).map((tab) => {
              const active = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{ paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: active ? "#6366f1" : "transparent" }}
                >
                  <Text
                    className={active ? "text-primary-600 font-semibold" : "text-typography-500"}
                  >
                    {tab === "general" ? "General" : "Booking"}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        )}

        {/* General tab */}
        {(isNew || activeTab === "general") && (
          <VStack className="gap-4 w-full">
            <VStack className="gap-2">
              <Text className="text-typography-700">Location</Text>
              <PlacesTextInput
                value={locationText}
                placeId={location?.placeId}
                readOnly={false}
                handleSelect={handlePlaceSelect}
                handleSelectError={handlePlaceSelectError}
              />
            </VStack>

            <VStack className="gap-2">
              <Text className="text-typography-700">Name (optional)</Text>
              <Input>
                <InputField
                  value={name}
                  placeholder="Venue name"
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isSaving}
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-typography-700">Website</Text>
              <Input>
                <InputField
                  value={website}
                  placeholder="https://…"
                  onChangeText={setWebsite}
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-typography-700">Booking contact</Text>
              <Input>
                <InputField
                  value={bookingContact}
                  placeholder="Email or phone"
                  onChangeText={setBookingContact}
                  editable={!isSaving}
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-typography-700">Size</Text>
              <Dropdown
                value={size}
                disabled={isSaving}
                onSelect={(v) => setSize(v as VenueSize)}
                options={sizeOptions}
                initialLabel="Choose size..."
                testID="venue-size"
              />
            </VStack>

            <VStack className="gap-2">
              <Text className="text-typography-700">Music types</Text>
              <Input>
                <InputField
                  value={musicTypesText}
                  placeholder="rock, jazz, …"
                  onChangeText={setMusicTypesText}
                  editable={!isSaving}
                />
              </Input>
            </VStack>

            <HStack className="gap-2 pt-2">
              <Button onPress={onSave} isDisabled={!canSave}>
                <ButtonText>{isNew ? "Create" : "Save"}</ButtonText>
              </Button>
              <Button variant="outline" onPress={() => router.back()} isDisabled={isSaving}>
                <ButtonText>Back</ButtonText>
              </Button>
            </HStack>
          </VStack>
        )}

        {/* Booking tab */}
        {!isNew && activeTab === "booking" && (
          <BookingInstructionsEditor venueId={id} />
        )}
      </VStack>
    </BaseScrollLayout>
  );
}
