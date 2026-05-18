import React from 'react';
import { Button, ButtonText } from '@/components/ui/button';

interface BottomButtonProps {
  onPress: (val: any) => void;
  label: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  action?: 'primary' | 'secondary' | 'positive' | 'negative';
  disabled?: boolean;
}

export const BottomButton: React.FC<BottomButtonProps> = ({
  onPress,
  label,
  accessibilityLabel,
  accessibilityHint,
  action = 'primary',
  disabled = false,
}) => {
  return (
    <Button
      className="shadow-md rounded-lg m-1"
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      action={action}
      disabled={disabled}
    >
      <ButtonText>{label}</ButtonText>
    </Button>
  );
};
