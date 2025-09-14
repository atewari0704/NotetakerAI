import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useHover } from '@/hooks';
import { colors } from '@/config';

interface HoverCheckboxProps {
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
}

export const HoverCheckbox: React.FC<HoverCheckboxProps> = ({
  onPress,
  style,
  size = 22,
}) => {
  const { isHovered, onMouseEnter, onMouseLeave, onPressIn, onPressOut } = useHover();

  const checkboxStyle = [
    styles.checkboxCircle,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: isHovered ? colors.success : colors.background.primary,
      borderColor: isHovered ? colors.success : colors.border.medium,
    },
    style,
  ];

  return (
    <TouchableOpacity
      style={checkboxStyle}
      onPress={onPress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.8}
    />
  );
};

const styles = StyleSheet.create({
  checkboxCircle: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
