import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/common/ctx";
import { ensureString } from "@/common/utils";
import { fetchVenues } from "@/common/data-utils";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { Venue } from "@/models/Venue";
import { PlusIcon } from "lucide-react-native";

export function VenueList() {
  const session = useSession();
  const username = ensureString(session.username);
  const router = useRouter();

  const { data, isFetching } = useQuery({
    queryKey: ["venues", username],
    queryFn: () => fetchVenues(session, username),
    initialData: [],
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });

  const venues = (data ?? []) as Venue[];

  return (
    <Box className="flex-1 bg-white p-4">
      {isFetching ? <Spinner size="large" /> : null}

      <VStack className="gap-3">
        {venues.length === 0 ? (
          <Text className="text-typography-600">No venues found.</Text>
        ) : (
          <FlatList
            data={venues}
            keyExtractor={(v) => String(v.id)}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push((`/(secure)/(home)/(venues)/${item.id}`) as any)
                }
                style={{ paddingVertical: 12 }}
              >
                <Text className="text-typography-900" style={{ fontWeight: "600" }}>
                  {item.location?.displayName ?? `Venue ${item.id}`}
                </Text>
                <Text className="text-typography-600">
                  {item.location?.formattedAddress ?? ""}
                </Text>
              </Pressable>
            )}
          />
        )}
      </VStack>
      <Pressable
        onPress={() => router.push("/(secure)/(home)/(venues)/0" as any)}
        accessibilityRole="button"
        accessibilityLabel="Add venue"
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

