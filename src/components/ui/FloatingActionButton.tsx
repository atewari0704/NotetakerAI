import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native';
import { useHover } from '@/hooks';
import { colors } from '@/config';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '+',
  size = 56,
  style,
  disabled = false,
}) => {
  const { isHovered, onMouseEnter, onMouseLeave, onPressIn, onPressOut } = useHover();

  const buttonStyle = [
    styles.fab,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: isHovered ? colors.button.primaryHover : colors.button.primary,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];

  const textStyle = [
    styles.icon,
    {
      fontSize: size * 0.4,
    },
  ];

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
});
