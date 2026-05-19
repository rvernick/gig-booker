import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/common/ctx';
import { VStack } from '../ui/vstack';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { Heading } from '../ui/heading';
import { Pressable } from '../ui/pressable';
import { Icon } from '../ui/icon';
import { Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAllVenues, fetchFavoriteVenues, addFavoriteVenue, removeFavoriteVenue } from '@/common/data-utils';
import { Venue } from '@/models/Venue';

type Props = {
  favoritesOnly?: boolean;
};

export const VenueListComponent: React.FC<Props> = ({ favoritesOnly = false }) => {
  const session = useSession();
  const username = session.username ?? '';
  const queryClient = useQueryClient();

  const venueQueryKey = favoritesOnly ? ['venue-favorites', username] : ['venues'];
  const fetchFn = favoritesOnly
    ? () => fetchFavoriteVenues(session, username)
    : () => fetchAllVenues(session, username);

  const { data: venues = [], isFetching } = useQuery({
    queryKey: venueQueryKey,
    queryFn: fetchFn,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['venue-favorites', username],
    queryFn: () => fetchFavoriteVenues(session, username),
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  });

  const favoriteIds = new Set(favorites.map((v) => v.id));

  const toggleFavorite = useCallback(
    async (venue: Venue) => {
      if (favoriteIds.has(venue.id)) {
        await removeFavoriteVenue(session, username, venue.id);
      } else {
        await addFavoriteVenue(session, username, venue.id);
      }
      queryClient.invalidateQueries({ queryKey: ['venue-favorites', username] });
    },
    [favoriteIds, session, username, queryClient],
  );

  if (isFetching && venues.length === 0) {
    return (
      <SafeAreaView>
        <Text>Loading venues…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VStack className="flex-1 p-4">
        <Heading size="lg" className="mb-4">
          {favoritesOnly ? 'Favorite Venues' : 'Venues'}
        </Heading>
        {venues.length === 0 ? (
          <Text>{favoritesOnly ? 'No favorites yet. Tap the star on any venue.' : 'No venues found.'}</Text>
        ) : (
          <FlatList
            data={venues}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <VenueRow
                venue={item}
                isFavorite={favoriteIds.has(item.id)}
                onToggleFavorite={() => toggleFavorite(item)}
              />
            )}
          />
        )}
      </VStack>
    </SafeAreaView>
  );
};

type VenueRowProps = {
  venue: Venue;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const VenueRow: React.FC<VenueRowProps> = ({ venue, isFavorite, onToggleFavorite }) => {
  const [pressing, setPressing] = useState(false);

  return (
    <HStack className="w-full items-center justify-between py-3 border-b border-gray-200">
      <VStack className="flex-1 mr-2">
        <Text className="font-semibold text-base">{venue.name ?? 'Unnamed Venue'}</Text>
        {venue.location && (
          <Text className="text-sm text-gray-500">{venue.location.formattedAddress}</Text>
        )}
        {venue.musicTypes && venue.musicTypes.length > 0 && (
          <Text className="text-xs text-gray-400">{venue.musicTypes.join(', ')}</Text>
        )}
      </VStack>
      <Pressable
        onPress={onToggleFavorite}
        onPressIn={() => setPressing(true)}
        onPressOut={() => setPressing(false)}
        accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        className="p-2"
      >
        <Icon
          as={Star}
          size="md"
          color={isFavorite ? '#f59e0b' : '#9ca3af'}
          fill={isFavorite ? '#f59e0b' : 'none'}
        />
      </Pressable>
    </HStack>
  );
};
