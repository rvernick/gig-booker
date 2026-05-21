import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSession } from "@/common/ctx";
import { ensureString } from "@/common/utils";
import { fetchBandsByUser } from "@/common/data-utils";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { Band } from "@/models/Band";
import { Spinner } from "../ui/spinner";
import { HStack } from "../ui/hstack";
import GBAvatarComponent from "@/components/common/GBAvatarComponent";
import { PlusIcon } from "lucide-react-native";

function bandAvatarFallback(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0] ?? "";
    const b = parts[1][0] ?? "";
    return `${a}${b}`.toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

export function BandList() {
  const session = useSession();
  const username = ensureString(session.username);
  const router = useRouter();

  const { data: bands, isFetching } = useQuery<Band[]>({
    queryKey: ["bands", username],
    queryFn: () => fetchBandsByUser(session, username),
    initialData: [],
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });

  return (
    <Box className="flex-1 bg-white p-4">
      {isFetching && <Spinner size="large"/>}
      <VStack className="gap-3">
        {bands.length === 0 ? (
          <Text className="text-typography-600">
            {isFetching ? 'Searching the airwaves for your band' : 'No bands found for this user'}
          </Text>
        ) : (
          <FlatList
            data={bands}
            keyExtractor={(b) => String(b.id)}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push(
                    (`/(secure)/(home)/(bands)/${item.id}`) as any,
                  )
                }
                style={{ paddingVertical: 12 }}
              >
                <HStack className="items-center gap-3">
                  <GBAvatarComponent
                    size="md"
                    photoId={item.photoId ?? undefined}
                    fallbackText={bandAvatarFallback(item.name)}
                  />
                  <VStack className="flex-1">
                    <Text className="text-typography-900" style={{ fontWeight: "600" }}>
                      {item.name}
                    </Text>
                    <Text className="text-typography-600">Band ID: {item.id}</Text>
                  </VStack>
                </HStack>
              </Pressable>
            )}
          />
        )}
      </VStack>
      <Pressable
        onPress={() => router.push("/(secure)/(home)/(bands)/0" as any)}
        accessibilityRole="button"
        accessibilityLabel="Add band"
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

