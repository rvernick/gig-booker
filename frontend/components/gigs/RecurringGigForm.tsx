import { useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSession } from "@/common/ctx";
import { ensureString } from "@/common/utils";
import {
  createRecurringGig,
  updateRecurringGig,
  fetchBandsByUser,
  fetchVenues,
} from "@/common/data-utils";
import type { RecurringGig } from "@/models/RecurringGig";
import type { Band } from "@/models/Band";
import type { Venue } from "@/models/Venue";
import { FrequencyType } from "@/models/frequency-type.enum";
import { DayOfWeek } from "@/models/day-of-week.enum";
import { WeekOrdinal } from "@/models/week-ordinal.enum";
import { GigTimeOfDay } from "@/models/gig-time-of-day.enum";

const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: "Monday",
  [DayOfWeek.TUESDAY]: "Tuesday",
  [DayOfWeek.WEDNESDAY]: "Wednesday",
  [DayOfWeek.THURSDAY]: "Thursday",
  [DayOfWeek.FRIDAY]: "Friday",
  [DayOfWeek.SATURDAY]: "Saturday",
  [DayOfWeek.SUNDAY]: "Sunday",
};

const ORDINAL_LABELS: Record<WeekOrdinal, string> = {
  [WeekOrdinal.FIRST]: "First",
  [WeekOrdinal.SECOND]: "Second",
  [WeekOrdinal.THIRD]: "Third",
  [WeekOrdinal.FOURTH]: "Fourth",
};

const TIME_LABELS: Record<GigTimeOfDay, string> = {
  [GigTimeOfDay.AFTERNOON]: "Afternoon",
  [GigTimeOfDay.EVENING]: "Evening",
  [GigTimeOfDay.NIGHT]: "Night",
};

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

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

type Props = {
  recurringGig?: RecurringGig;
  onSaved: () => void;
  onCancel: () => void;
};

export function RecurringGigForm({ recurringGig, onSaved, onCancel }: Props) {
  const session = useSession();
  const username = ensureString(session.username);
  const queryClient = useQueryClient();
  const isEditing = recurringGig != null;

  const [selectedBandId, setSelectedBandId] = useState<number | null>(recurringGig?.bandId ?? null);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(recurringGig?.venueId ?? null);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(recurringGig?.frequencyType ?? FrequencyType.WEEKLY);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | null>(recurringGig?.dayOfWeek ?? null);
  const [weekOrdinal, setWeekOrdinal] = useState<WeekOrdinal | null>(recurringGig?.weekOrdinal ?? null);
  const [timeOfDay, setTimeOfDay] = useState<GigTimeOfDay>(recurringGig?.timeOfDay ?? GigTimeOfDay.NIGHT);
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

  const isMonthly = frequencyType === FrequencyType.MONTHLY;

  const canSubmit =
    selectedBandId !== null &&
    selectedVenueId !== null &&
    dayOfWeek !== null &&
    (!isMonthly || weekOrdinal !== null);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    setError(null);
    try {
      const args = {
        bandId: selectedBandId!,
        venueId: selectedVenueId!,
        frequencyType,
        dayOfWeek: dayOfWeek!,
        weekOrdinal: isMonthly ? weekOrdinal : null,
        timeOfDay,
      };
      if (isEditing) {
        await updateRecurringGig(session, username, recurringGig.id, args);
      } else {
        await createRecurringGig(session, username, args);
      }
      await queryClient.refetchQueries({ queryKey: ["recurring-gigs", username] });
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
          <Heading size="lg">{isEditing ? "Edit Recurring Gig" : "New Recurring Gig"}</Heading>
          <Pressable onPress={onCancel}>
            <Text style={{ color: "#6b7280" }}>Cancel</Text>
          </Pressable>
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
          <Text style={{ fontWeight: "600" }}>Frequency</Text>
          <HStack>
            <Chip
              label="Weekly"
              selected={frequencyType === FrequencyType.WEEKLY}
              onPress={() => {
                setFrequencyType(FrequencyType.WEEKLY);
                setWeekOrdinal(null);
              }}
            />
            <Chip
              label="Monthly"
              selected={frequencyType === FrequencyType.MONTHLY}
              onPress={() => setFrequencyType(FrequencyType.MONTHLY)}
            />
          </HStack>
        </VStack>

        {isMonthly && (
          <VStack className="gap-2">
            <Text style={{ fontWeight: "600" }}>Which week of the month</Text>
            <HStack style={{ flexWrap: "wrap" }}>
              {Object.values(WeekOrdinal).map((o) => (
                <Chip
                  key={o}
                  label={ORDINAL_LABELS[o]}
                  selected={weekOrdinal === o}
                  onPress={() => setWeekOrdinal(o)}
                />
              ))}
            </HStack>
          </VStack>
        )}

        <VStack className="gap-2">
          <Text style={{ fontWeight: "600" }}>Day of week</Text>
          <HStack style={{ flexWrap: "wrap" }}>
            {Object.values(DayOfWeek).map((d) => (
              <Chip
                key={d}
                label={DAY_LABELS[d]}
                selected={dayOfWeek === d}
                onPress={() => setDayOfWeek(d)}
              />
            ))}
          </HStack>
        </VStack>

        <VStack className="gap-2">
          <Text style={{ fontWeight: "600" }}>Time of day</Text>
          <HStack style={{ flexWrap: "wrap" }}>
            {Object.values(GigTimeOfDay).map((t) => (
              <Chip
                key={t}
                label={TIME_LABELS[t]}
                selected={timeOfDay === t}
                onPress={() => setTimeOfDay(t)}
              />
            ))}
          </HStack>
        </VStack>

        {error && <Text className="text-red-600">{error}</Text>}

        <Button onPress={handleSubmit} isDisabled={!canSubmit || isSaving}>
          {isSaving ? <Spinner size="small" /> : <ButtonText>Save Recurring Gig</ButtonText>}
        </Button>
      </VStack>
    </ScrollView>
  );
}
