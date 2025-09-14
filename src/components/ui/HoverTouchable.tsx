import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { useHover } from '@/hooks';

interface HoverTouchableProps extends TouchableOpacityProps {
  hoverStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * TouchableOpacity with hover effects
 * Applies hoverStyle when hovered
 */
export const HoverTouchable: React.FC<HoverTouchableProps> = ({
  style,
  hoverStyle,
  children,
  onPress,
  ...props
}) => {
  const { isHovered, onMouseEnter, onMouseLeave, onPressIn, onPressOut } = useHover();

  const handlePress = (event: any) => {
    if (onPress) {
      onPress(event);
    }
  };

  const combinedStyle = [
    style,
    isHovered && hoverStyle,
  ];

  return (
    <TouchableOpacity
      style={combinedStyle}
      onPress={handlePress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};
