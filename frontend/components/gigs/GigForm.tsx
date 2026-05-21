import { useState } from "react";
import { ScrollView } from "react-native";
import { Pressable } from "react-native";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSession } from "@/common/ctx";
import { ensureString } from "@/common/utils";
import { createGig, updateGig, fetchBandsByUser, fetchVenues } from "@/common/data-utils";
import type { Gig } from "@/models/Gig";
import type { Band } from "@/models/Band";
import type { Venue } from "@/models/Venue";

type ChipProps = { label: string; selected: boolean; onPress: () => void };

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: selected ? "#6366f1" : "#d1d5db",
        backgroundColor: selected ? "#eef2ff" : "#f9fafb",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: selected ? "#4338ca" : "#374151", fontWeight: selected ? "600" : "400" }}>
        {label}
      </Text>
    </Pressable>
  );
}

type Props = { gig?: Gig; onSaved: () => void; onCancel: () => void };

export function GigForm({ gig, onSaved, onCancel }: Props) {
  const session = useSession();
  const username = ensureString(session.username);
  const queryClient = useQueryClient();
  const isEditing = gig != null;

  const [selectedBandId, setSelectedBandId] = useState<number | null>(gig?.bandId ?? null);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(gig?.venueId ?? null);
  const [date, setDate] = useState(gig?.date ?? "");
  const [startTime, setStartTime] = useState(gig?.startTime ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: bands, isFetching: fetchingBands } = useQuery<Band[]>({
    queryKey: ["bands", username],
    queryFn: () => fetchBandsByUser(session, username),
    initialData: [],
  });

  const { data: venues, isFetching: fetchingVenues } = useQuery<Venue[]>({
    queryKey: ["venues", username],
    queryFn: () => fetchVenues(session, username),
    initialData: [],
  });

  const canSubmit =
    selectedBandId !== null &&
    selectedVenueId !== null &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    /^\d{2}:\d{2}$/.test(startTime);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    setError(null);
    try {
      const args = {
        bandId: selectedBandId!,
        venueId: selectedVenueId!,
        date,
        startTime,
      };
      if (isEditing) {
        await updateGig(session, username, gig.id, args);
      } else {
        await createGig(session, username, args);
      }
      await queryClient.refetchQueries({ queryKey: ["gigs", username] });
      onSaved();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (fetchingBands || fetchingVenues) {
    return <Spinner size="large" />;
  }

  return (
    <ScrollView>
      <VStack className="gap-5 p-4">
        <HStack className="items-center justify-between">
          <Heading size="lg">{isEditing ? "Edit Gig" : "New Gig"}</Heading>
          <Button size="sm" variant="outline" onPress={onCancel}>
            <ButtonText>Cancel</ButtonText>
          </Button>
        </HStack>

        <VStack className="gap-2">
          <Text style={{ fontWeight: "600" }}>Band</Text>
          <HStack style={{ flexWrap: "wrap" }}>
            {bands.map((b) => (
              <Chip
                key={b.id}
                label={b.name}
                selected={selectedBandId === b.id}
                onPress={() => setSelectedBandId(b.id)}
              />
            ))}
          </HStack>
        </VStack>

        <VStack className="gap-2">
          <Text style={{ fontWeight: "600" }}>Venue</Text>
          <HStack style={{ flexWrap: "wrap" }}>
            {venues.map((v) => (
              <Chip
                key={v.id}
                label={v.name ?? v.location?.displayName ?? `Venue ${v.id}`}
                selected={selectedVenueId === v.id}
                onPress={() => setSelectedVenueId(v.id)}
              />
            ))}
          </HStack>
        </VStack>

        <VStack className="gap-2">
          <Text style={{ fontWeight: "600" }}>Date</Text>
          <Input>
            <InputField
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
              maxLength={10}
            />
          </Input>
        </VStack>

        <VStack className="gap-2">
          <Text style={{ fontWeight: "600" }}>Start time</Text>
          <Input>
            <InputField
              placeholder="HH:MM (e.g. 20:00)"
              value={startTime}
              onChangeText={setStartTime}
              keyboardType="numeric"
              maxLength={5}
            />
          </Input>
        </VStack>

        {error && <Text className="text-red-600">{error}</Text>}

        <Button onPress={handleSubmit} isDisabled={!canSubmit || isSaving}>
          {isSaving ? <Spinner size="small" /> : <ButtonText>Save Gig</ButtonText>}
        </Button>
      </VStack>
    </ScrollView>
  );
}
