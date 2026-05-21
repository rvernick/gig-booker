import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/common/ctx";
import { ensureString } from "@/common/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { Venue } from "@/models/Venue";
import { PlusIcon } from "lucide-react-native";
import { HStack } from "../ui/hstack";
import { useEffect, useState } from "react";
import { Icon, StarIcon } from "../ui/icon";
import { addFavoriteVenue, fetchVenues, removeFavoriteVenue } from "@/common/venue-utils";
import { Button, ButtonIcon } from "../ui/button";

export function VenueList() {
  const session = useSession();
  const username = ensureString(session.username);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pressing, setPressing] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ["venues", username],
    queryFn: () => fetchVenues(session, username),
    initialData: [],
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });

  const venues = (data ?? []) as Venue[];

  type VenueRowProps = {
    venue: Venue;
  };

  const VenueRow: React.FC<VenueRowProps> = ({ venue }) => {
    const [isFavorite, setIsFavorite] = useState(venue.isFavorite);
    const [iconSize, setIconSize] = useState<"lg" | "md" | "sm" | "xl">('lg');

    // console.log('VenueRow ', venue);

    const toggleFavorite = async () => {
      console.log('Toggle start: ', isFavorite);
      if (isFavorite) {
        setIsFavorite(false);
        await removeFavoriteVenue(session, username, venue.id);
      } else {
        setIsFavorite(true);
        await addFavoriteVenue(session, username, venue.id);
      }
      queryClient.invalidateQueries({ queryKey: ['venue-favorites', username] });
      queryClient.invalidateQueries({ queryKey: ['venues', username] });
    };

    useEffect(() => {
      setIconSize(isFavorite ? "lg" : "sm");
    }, [isFavorite]);

    return (
      <HStack className="w-full items-center justify-between py-3 border-b border-gray-200">
        <VStack className="flex-1 mr-2">
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push((`/(secure)/(home)/(venues)/${venue.id}`) as any)
            }
            style={{ paddingVertical: 12 }}
          >
            <Text className="font-semibold text-base">{venue.name ?? 'Unnamed Venue'}</Text>
            {venue.location && (
              <Text className="text-sm text-gray-500">{venue.location.formattedAddress}</Text>
            )}
            {venue.musicTypes && venue.musicTypes.length > 0 && (
              <Text className="text-xs text-gray-400">{venue.musicTypes.join(', ')}</Text>
            )}
          </Pressable>
        </VStack>
        <Button
          onPress={toggleFavorite}
          className="bg-transparent hover:bg-transparent"
          style={{
            backgroundColor: 'transparent' // not sure why hove:bg-transparent doesn't seem to work
          }}
          onHoverIn={()=>setIconSize("xl")}
          onHoverOut={()=>setIconSize(isFavorite ? "lg" : "sm")}
          >
          <ButtonIcon className="hover:#f59e0b" as={StarIcon} size={iconSize} color={isFavorite ? '#f59e0b' : '#9ca3af'}/>
        </Button>
      </HStack>
    );
  };

  return (
    <Box className="flex-1 bg-white p-4">
      {isFetching && !pressing ? <Spinner size="large" /> : null}

      <VStack className="gap-3">
        {venues.length === 0 ? (
          <Text className="text-typography-600">No venues found.</Text>
        ) : (
          <FlatList
            data={venues}
            keyExtractor={(v) => String(v.id)}
            renderItem={({ item }) => (
              <VenueRow venue={item} key={item.id} />
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

