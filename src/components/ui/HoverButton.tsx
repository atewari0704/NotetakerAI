import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from 'react-native';
import { useButtonHover } from '@/hooks';
import { colors } from '@/config';

interface HoverButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const HoverButton: React.FC<HoverButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  textStyle,
  disabled = false,
  onPress,
  ...props
}) => {
  const getBaseColor = (): string => {
    if (disabled) {
      return colors.neutral.silver;
    }

    switch (variant) {
      case 'secondary':
        return colors.button.secondary;
      case 'danger':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.button.primary;
    }
  };

  const getHoverColor = (): string => {
    if (disabled) {
      return colors.neutral.silver;
    }

    switch (variant) {
      case 'secondary':
        return colors.button.secondaryHover;
      case 'danger':
        return '#dc2626'; // Darker red
      case 'success':
        return '#059669'; // Darker green
      default:
        return colors.button.primaryHover;
    }
  };

  const { backgroundColor, onMouseEnter, onMouseLeave, onPressIn, onPressOut } = useButtonHover(
    getBaseColor(),
    getHoverColor()
  );

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 12;
        break;
      case 'large':
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 24;
        break;
      default:
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 16;
    }

    return [baseStyle, style];
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: variant === "secondary" ? colors.text.primary : colors.text.inverse,
      fontWeight: '600',
    };

    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default:
        baseStyle.fontSize = 16;
    }

    return [baseStyle, textStyle];
  };

  const handlePress = (event: any) => {
    if (onPress && !disabled) {
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
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};
