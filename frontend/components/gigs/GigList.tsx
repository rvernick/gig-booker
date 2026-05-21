import { useState } from "react";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useSession } from "@/common/ctx";
import { ensureString } from "@/common/utils";
import { deleteGig, fetchGigsForUser } from "@/common/data-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlatList, Pressable } from "react-native";
import type { Gig } from "@/models/Gig";
import { Spinner } from "@/components/ui/spinner";
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon } from "lucide-react-native";
import { tabBarIconSize } from "@/common/constants";
import { GigForm } from "./GigForm";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = Number(hourStr);
  const minute = minuteStr ?? "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${minute} ${ampm}`;
}

function GigListItem({
  item,
  onDelete,
  onEdit,
}: {
  item: Gig;
  onDelete: (id: number) => void;
  onEdit: (gig: Gig) => void;
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
            <Text style={{ fontWeight: "700", fontSize: 16 }}>
              {item.band?.name ?? "Unknown Band"}
            </Text>
            <HStack className="items-center gap-2">
              <CalendarIcon size={tabBarIconSize} color="#6b7280" />
              <Text className="text-typography-700">{formatDate(item.date)}</Text>
            </HStack>
            <HStack className="items-center gap-2">
              <ClockIcon size={tabBarIconSize} color="#6b7280" />
              <Text className="text-typography-700">{formatTime(item.startTime)}</Text>
            </HStack>
            <HStack className="items-center gap-2">
              <MapPinIcon size={tabBarIconSize} color="#6b7280" />
              <VStack>
                {item.venue?.name ? (
                  <Text className="text-typography-700">{item.venue.name}</Text>
                ) : null}
                <Text className="text-typography-500">
                  {item.venue?.location?.displayName ?? ""}
                </Text>
              </VStack>
            </HStack>
          </VStack>
          <Button size="sm" variant="outline" onPress={() => onDelete(item.id)}>
            <ButtonText>Remove</ButtonText>
          </Button>
        </HStack>
      </Box>
    </Pressable>
  );
}

export function GigList() {
  const session = useSession();
  const username = ensureString(session.username);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);

  const { data: gigs, isFetching } = useQuery<Gig[]>({
    queryKey: ["gigs", username],
    queryFn: () => fetchGigsForUser(session, username),
    initialData: [],
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });

  const handleDelete = async (id: number) => {
    await deleteGig(session, username, id);
    await queryClient.refetchQueries({ queryKey: ["gigs", username] });
  };

  if (showForm || editingGig != null) {
    return (
      <GigForm
        gig={editingGig ?? undefined}
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
          <Text className="text-typography-600">No upcoming gigs found.</Text>
        ) : (
          <FlatList
            data={gigs}
            keyExtractor={(g) => String(g.id)}
            renderItem={({ item }) => (
              <GigListItem item={item} onDelete={handleDelete} onEdit={setEditingGig} />
            )}
          />
        )}
      </VStack>
      <Pressable
        onPress={() => setShowForm(true)}
        accessibilityRole="button"
        accessibilityLabel="Add gig"
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
