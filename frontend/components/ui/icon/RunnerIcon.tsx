
import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface RunnerIconProps {
  size?: number;
  color?: string;
  style?: ImageStyle;
}

export const RunnerIcon: React.FC<RunnerIconProps> = ({ size = 24, color, style }) => {
  return (
    <Image
      source={require('@/assets/images/run_circle_24dp_1F1F1F.svg')}
      style={[
        {
          width: size,
          height: size,
          tintColor: color,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};
