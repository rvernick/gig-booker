import React, { useEffect, useState } from 'react';
import { useQuery } from'@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSession } from '@/common/ctx';
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from '../ui/vstack';
import { AngryIcon, BadgeDollarSignIcon, DiscIcon, PlaneLandingIcon } from 'lucide-react-native';
import { Text } from '../ui/text';
import { devLog, ensureNumber } from '@/common/utils';

import { allUsers } from '@/common/data-utils';
import {AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import { useGlobalContext } from '@/common/GlobalContext';
import { User } from '@/models/User';

// Example component
const MapDemoComponent = () => {
  const session = useSession();
  const appContext = useGlobalContext();
  const username = session.username ? session.username : '';
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(true);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [markerUsers, setMarkerUsers] = useState<User[]>([]);

  // const preferences = controller.getUserPreferences(session);

  const syncGoogleMapsKey = async () => {
    setGoogleMapsApiKey(await appContext.getGoogleMapsAPIKey(session, ''));
  }

  const { data, error, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: () => allUsers(session, username),
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
    refetchInterval: 5*60*1000,
    initialData: [],
  })

  useEffect(() => {
    if (googleMapsApiKey === '') {
      syncGoogleMapsKey();
    }
    if (isUpdating && !isFetching) {
      setIsUpdating(false);
    }
  }, [googleMapsApiKey]);

  useEffect(() => {
    devLog('marker users from: ', data);
    if (data && data.length > 0) {
      const users = data.filter((user) => user.homeLocation != null);
      setMarkerUsers(users);
    }
  }, [data]);

  if (error) {
    return (
      <Text>
        An error occured!
      </Text>
    )
  }
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  type UserMarkerProps = {
    user: User;
  };

  const UserMarker: React.FC<UserMarkerProps> = ({ user }) => {
    const long = ensureNumber(user.homeLocation?.coordinates.coordinates[0]);
    const lat = ensureNumber(user.homeLocation?.coordinates.coordinates[1]);
    devLog('user marker ', long, lat);

    const userColor = (user: User) => {
      return 'black';
    }

    const UserIconMarker: React.FC<UserMarkerProps> = ({ user }) => {
      const size = '28';
      if (user.unscheduledRequests > 0) {
        return <AngryIcon size={size} color={'red'}/>
      } else if (user.scheduledServices > 0) {
        return <BadgeDollarSignIcon size={size} color={'green'}/>
      }
      return <DiscIcon size={'18'} color={'grey'}/>
    }

    return (
      <AdvancedMarker
        key={user.id}
        title={user.firstName + ' ' + user.lastName}
        position={{lat: lat, lng: long}}>
          <UserIconMarker user={user}/>
           {/* <PlaneLandingIcon size='28' color={userColor(user)}/> */}
        </AdvancedMarker>
    )
  }

  if (googleMapsApiKey === '') {
    return (
      <Text>
        Please wait while we sync your Google Maps API key.
      </Text>
    )
  }
  return (
    <SafeAreaView className="w-full h-full bottom-1">
      <VStack className="w-full h-full">
        <APIProvider apiKey={googleMapsApiKey}>
        <Map
          mapId={'users'}
          style={{width: '100vw', height: '100vh'}}
          defaultCenter={{lat: 37.788, lng: -122.432}}
          defaultZoom={13}
          gestureHandling='greedy'
          zoomControl={true}
        >
          {markerUsers?.map((user) => (
            <UserMarker key={user.id} user={user} />
          ))}
        </Map>
      </APIProvider>
      </VStack>
    </SafeAreaView>
  );
};


export default MapDemoComponent;
