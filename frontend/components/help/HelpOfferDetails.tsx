import React from 'react';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';

interface HelpOffer {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'active' | 'completed';
}

interface HelpOfferDetailsProps {
  item: HelpOffer;
  onCancel?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export const HelpOfferDetails: React.FC<HelpOfferDetailsProps> = ({
  item,
  onCancel,
  onStart,
  onComplete,
}) => {
  return (
    <Box className="p-4 border border-outline-200 rounded-lg bg-background-50 mb-4 shadow-sm">
      <VStack className="gap-4">
        {/* Header with Title and Status */}
        <VStack className="gap-1">
          <HStack className="justify-between items-start">
            <Heading size="md" className="flex-1 mr-2">{item.title}</Heading>
            <Badge
              size="md"
              variant="solid"
              action={item.status === 'open' ? 'info' : item.status === 'active' ? 'warning' : 'success'}
            >
              <BadgeText>{item.status.toUpperCase()}</BadgeText>
            </Badge>
          </HStack>
          <Text className="text-sm text-typography-700 leading-5">
            {item.description}
          </Text>
        </VStack>

        {/* Action Buttons */}
        <HStack className="gap-3 mt-2">
          {item.status === 'open' && (
            <Button
              className="flex-1"
              variant="outline"
              action="primary"
              onPress={() => onStart?.(item.id)}
            >
              <ButtonText>Start</ButtonText>
            </Button>
          )}
          {item.status === 'active' && (
            <Button
              className="flex-1"
              variant="solid"
              action="secondary"
              onPress={() => onComplete?.(item.id)}
            >
              <ButtonText>Mark Completed</ButtonText>
            </Button>
          )}
          {item.status !== 'completed' && (
            <Button
              className="flex-1"
              variant="outline"
              action="negative"
              onPress={() => onCancel?.(item.id)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};