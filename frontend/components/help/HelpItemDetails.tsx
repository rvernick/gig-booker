import React from 'react';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'active' | 'completed';
  requiredSkills?: string[];
}

interface HelpItemDetailsProps {
  item: HelpItem;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const HelpItemDetails: React.FC<HelpItemDetailsProps> = ({ item, onEdit, onCancel }) => {
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
              action={item.status === 'open' ? 'info' : 'success'}
            >
              <BadgeText>{item.status.toUpperCase()}</BadgeText>
            </Badge>
          </HStack>
          <Text className="text-sm text-typography-700 leading-5">
            {item.description}
          </Text>
        </VStack>

        {/* Required Skills Section */}
        {item.requiredSkills && item.requiredSkills.length > 0 && (
          <VStack className="gap-2">
            <Text className="text-xs font-bold text-typography-500 uppercase tracking-wider">
              Required Skills
            </Text>
            <HStack className="gap-1 flex-wrap">
              {item.requiredSkills.map((skill) => (
                <Badge key={skill} size="sm" variant="outline" action="muted">
                  <BadgeText>{skill}</BadgeText>
                </Badge>
              ))}
            </HStack>
          </VStack>
        )}

        {/* Action Buttons */}
        <HStack className="gap-3 mt-2">
          <Button
            className="flex-1"
            variant="outline"
            action="primary"
            onPress={() => onEdit?.(item.id)}
          >
            <ButtonText>Edit</ButtonText>
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            action="negative"
            onPress={() => onCancel?.(item.id)}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};