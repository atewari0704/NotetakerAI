import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from 'react-native';
import { useButtonHover } from '@/hooks';

interface PriorityButtonProps extends TouchableOpacityProps {
  priority: number;
  isSelected?: boolean;
  showNumber?: boolean; // Show number instead of text label
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PriorityButton: React.FC<PriorityButtonProps> = ({
  priority,
  isSelected = false,
  showNumber = false,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Unknown';
    }
  };

  const getBaseColor = (): string => {
    // Default gray color when not selected
    return '#d1d5db';
  };

  const getHoverColor = (): string => {
    // Color scheme for hover/click states
    switch (priority) {
      case 1: return '#dc2626'; // Red for High priority
      case 2: return '#f59e0b'; // Yellow/Orange for Medium priority
      case 3: return '#10b981'; // Green for Low priority
      default: return '#d1d5db';
    }
  };

  const { backgroundColor, onMouseEnter, onMouseLeave, onPressIn, onPressOut } = useButtonHover(
    getBaseColor(),
    getHoverColor()
  );

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: isSelected ? getHoverColor() : backgroundColor,
      borderRadius: showNumber ? 16 : 24,
      borderWidth: 1,
      borderColor: isSelected ? getHoverColor() : '#d1d5db',
      paddingHorizontal: showNumber ? 0 : 20,
      paddingVertical: showNumber ? 0 : 12,
      width: showNumber ? 32 : undefined,
      height: showNumber ? 32 : undefined,
      alignItems: 'center',
      justifyContent: 'center',
    };

    return [baseStyle, style];
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: showNumber ? 14 : 16,
      fontWeight: showNumber ? '600' : '500',
      color: isSelected ? '#ffffff' : '#6b7280',
    };

    return [baseStyle, textStyle];
  };

  const handlePress = (event: any) => {
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={getTextStyle()}>{showNumber ? priority.toString() : getPriorityLabel(priority)}</Text>
    </TouchableOpacity>
  );
};
