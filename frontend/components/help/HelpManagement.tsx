import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';

import React, { useState, useMemo } from 'react';
import { FlatList } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { fetchOffers, fetchRequests } from '@/common/data-utils';
import { useSession } from '@/common/ctx';
import { useQuery } from '@tanstack/react-query';
import { devLog, ensureString } from '@/common/utils';
import { HelpItemDetails } from './HelpItemDetails';
import { HelpOfferDetails } from './HelpOfferDetails';

type HelpType = 'OFFER' | 'REQUEST';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  type: HelpType;
  authorId: string;
  neighborhoodId: string;
  requiredSkills?: string[];
  status: 'open' | 'active' | 'completed';
}

interface User {
  id: string;
  neighborhoodId: string;
  skills: string[];
}

// Mock current user for demonstration
const CURRENT_USER: User = {
  id: 'user_123',
  neighborhoodId: 'north_hills_01',
  skills: ['Gardening', 'Grocery Shopping', 'Basic Tech Support'],
};

// Mock data for demonstration
const MOCK_DATA: HelpItem[] = [
  { id: '1', title: 'Mowing Lawn', description: 'I can help mow lawns on weekends.', type: 'OFFER', authorId: 'user_123', neighborhoodId: 'north_hills_01', status: 'open' },
  { id: '2', title: 'Need groceries for Mrs. Higgins', description: 'My neighbor needs help getting milk and bread.', type: 'REQUEST', authorId: 'user_123', neighborhoodId: 'north_hills_01', status: 'open' },
  { id: '3', title: 'Broken WiFi', description: 'Need help fixing a router.', type: 'REQUEST', authorId: 'neighbor_456', neighborhoodId: 'north_hills_01', requiredSkills: ['Basic Tech Support'], status: 'open' },
  { id: '4', title: 'Dog Walking', description: 'Need someone to walk my dog.', type: 'REQUEST', authorId: 'neighbor_789', neighborhoodId: 'north_hills_01', requiredSkills: ['Pet Care'], status: 'open' },
  { id: '5', title: 'Tool Sharing', description: 'I have a power drill to lend.', type: 'OFFER', authorId: 'user_123', neighborhoodId: 'north_hills_01', status: 'active' },
];

type ViewTab = 'MY_OFFERS' | 'MY_REQUESTS' | 'QUALIFIED_REQUESTS';

export const HelpManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('MY_REQUESTS');
  const session = useSession();
  const username = ensureString(session.username);

  const { data: myRequests } = useQuery({
    queryKey: ['requests', username],
    queryFn: () => fetchRequests(session, username),
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
    initialData: [],
  });

  const { data: myOffers } = useQuery({
    queryKey: ['offers', username],
    queryFn: () => fetchOffers(session, username),
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
    initialData: [],
  })

  devLog('offers: ', myOffers);

  const emptyMessages = {
    MY_OFFERS: "You haven't made any help offers yet.",
    MY_REQUESTS: "You haven't created any help requests.",
    QUALIFIED_REQUESTS: "No requests found in your neighborhood matching your skills.",
  };

  return (
    <Box className="flex-1 bg-white p-4">
      <VStack className="gap-4 mb-5">
        <Heading size="xl">Help Dashboard</Heading>
      </VStack>

      {/* Navigation Tabs */}
      <HStack className="gap-1 mb-4 border-b border-outline-300">
        <TabButton
          label="Requests"
          isActive={activeTab === 'MY_REQUESTS'}
          onClick={() => setActiveTab('MY_REQUESTS')}
        />
        <TabButton
          label="Offers"
          isActive={activeTab === 'MY_OFFERS'}
          onClick={() => setActiveTab('MY_OFFERS')}
        />
        <TabButton
          label="Available"
          isActive={activeTab === 'QUALIFIED_REQUESTS'}
          onClick={() => setActiveTab('QUALIFIED_REQUESTS')}
        />
      </HStack>

      {/* List Content */}
      {activeTab === 'MY_REQUESTS' && (
        (myOffers.length > 0 ? (
          <FlatList
            data={myRequests}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => {
              return (
              <HelpItemDetails
                item={item}
                onEdit={(id) => console.log('Edit request:', id)}
                onCancel={(id) => console.log('Cancel request:', id)}
              />
              );
            }}
          />
        ) : (
          <Heading>No Requests Available</Heading>
        ))
      )}
      {activeTab === 'MY_OFFERS' && (
        (myOffers.length > 0 ? (
          <FlatList
            data={myOffers}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => {
              return (
                <HelpOfferDetails
                  item={item}
                  onComplete={(id) => console.log('complete request:', id)}
                  onCancel={(id) => console.log('Cancel request:', id)}
                  onStart={(id) => console.log('onStart ', id)}
                />
              );
            }}
          />
        ) : (
          <Heading>No Offers</Heading>
        ))
      )}
      {activeTab === 'QUALIFIED_REQUESTS' && (

          <Heading>Not Implemented Yet</Heading>

      )}
    </Box>
  );
};

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <Button
    variant="link"
    onPress={onClick}
    className={`px-4 rounded-none border-primary-500 ${
      isActive ? 'border-b-2' : 'border-b-0'
    }`}
  >
    <ButtonText className={isActive ? 'text-primary-500' : 'text-typography-500'}>
      {label}
    </ButtonText>
  </Button>
);
