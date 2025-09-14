import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ClockIcon } from './ClockIcon';
import { useHover } from '@/hooks';
import { colors } from '@/config';

interface FocusSessionButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
  disabled?: boolean;
}

export const FocusSessionButton: React.FC<FocusSessionButtonProps> = ({
  onPress,
  style,
  size = 56,
  disabled = false,
}) => {
  const { isHovered, onMouseEnter, onMouseLeave, onPressIn, onPressOut } = useHover();

  const buttonStyle = [
    styles.focusButton,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: isHovered ? colors.button.primaryHover : colors.button.primary,
      opacity: disabled ? 0.5 : 1,
      shadowColor: isHovered ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: isHovered ? 6 : 4,
      },
      shadowOpacity: isHovered ? 0.4 : 0.3,
      shadowRadius: isHovered ? 10 : 8,
      elevation: isHovered ? 10 : 8,
    },
    style,
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
      <ClockIcon
        size={size * 0.6}
        backgroundColor="transparent"
        iconColor={colors.text.inverse}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  focusButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
