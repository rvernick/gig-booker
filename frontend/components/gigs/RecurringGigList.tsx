import { useState } from "react";
import { FlatList, Pressable } from "react-native";
import { PlusIcon } from "lucide-react-native";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSession } from "@/common/ctx";
import { ensureString } from "@/common/utils";
import { deleteRecurringGig, fetchRecurringGigsForUser } from "@/common/data-utils";
import type { RecurringGig } from "@/models/RecurringGig";
import { FrequencyType } from "@/models/frequency-type.enum";
import { WeekOrdinal } from "@/models/week-ordinal.enum";
import { DayOfWeek } from "@/models/day-of-week.enum";
import { GigTimeOfDay } from "@/models/gig-time-of-day.enum";
import { RecurringGigForm } from "./RecurringGigForm";

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

function scheduleLabel(rg: RecurringGig): string {
  const day = DAY_LABELS[rg.dayOfWeek] ?? rg.dayOfWeek;
  if (rg.frequencyType === FrequencyType.MONTHLY && rg.weekOrdinal) {
    return `${ORDINAL_LABELS[rg.weekOrdinal]} ${day} of the month`;
  }
  return `Every ${day}`;
}

function RecurringGigItem({
  item,
  onDelete,
  onEdit,
}: {
  item: RecurringGig;
  onDelete: (id: number) => void;
  onEdit: (gig: RecurringGig) => void;
}) {
  return (
    <Pressable onPress={() => onEdit(item)}>
      <Box
        style={{
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <HStack className="items-center justify-between gap-3">
          <VStack className="flex-1 gap-1">
            <Text style={{ fontWeight: "700", fontSize: 15 }}>
              {item.band?.name ?? "Unknown Band"}
            </Text>
            <Text className="text-typography-700">{scheduleLabel(item)}</Text>
            <Text className="text-typography-700">
              {TIME_LABELS[item.timeOfDay] ?? item.timeOfDay}
            </Text>
            <Text className="text-typography-500">
              {item.venue?.name ?? item.venue?.location?.displayName ?? "Unknown Venue"}
            </Text>
          </VStack>
          <Button
            size="sm"
            variant="outline"
            onPress={() => onDelete(item.id)}
          >
            <ButtonText>Remove</ButtonText>
          </Button>
        </HStack>
      </Box>
    </Pressable>
  );
}

export function RecurringGigList() {
  const session = useSession();
  const username = ensureString(session.username);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState<RecurringGig | null>(null);

  const { data: gigs, isFetching } = useQuery<RecurringGig[]>({
    queryKey: ["recurring-gigs", username],
    queryFn: () => fetchRecurringGigsForUser(session, username),
    initialData: [],
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });

  const handleDelete = async (id: number) => {
    await deleteRecurringGig(session, username, id);
    await queryClient.refetchQueries({ queryKey: ["recurring-gigs", username] });
  };

  if (showForm || editingGig != null) {
    return (
      <RecurringGigForm
        recurringGig={editingGig ?? undefined}
        onSaved={() => {
          setShowForm(false);
          setEditingGig(null);
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingGig(null);
        }}
      />
    );
  }

  return (
    <Box className="flex-1 bg-white p-4">
      {isFetching && <Spinner size="large" />}
      <VStack className="gap-3">
        {gigs.length === 0 && !isFetching ? (
          <Text className="text-typography-600">No recurring gigs set up yet.</Text>
        ) : (
          <FlatList
            data={gigs}
            keyExtractor={(g) => String(g.id)}
            renderItem={({ item }) => (
              <RecurringGigItem
                item={item}
                onDelete={handleDelete}
                onEdit={setEditingGig}
              />
            )}
          />
        )}
      </VStack>
      <Pressable
        onPress={() => setShowForm(true)}
        accessibilityRole="button"
        accessibilityLabel="Add recurring gig"
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#0a7ea4',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <PlusIcon size={24} color="white" />
      </Pressable>
    </Box>
  );
}
