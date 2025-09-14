import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { THEME_CONFIG } from '@/config/app';
import { colors } from '@/config';
import { useButtonHover } from '@/hooks';

interface CustomButtonProps extends Omit<ButtonProps, 'mode'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Button: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  labelStyle,
  disabled,
  loading,
  children,
  onPress,
  ...props
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: THEME_CONFIG.borderRadius.md,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (size) {
      case 'small':
        baseStyle.paddingVertical = THEME_CONFIG.spacing.xs;
        baseStyle.paddingHorizontal = THEME_CONFIG.spacing.sm;
        break;
      case 'large':
        baseStyle.paddingVertical = THEME_CONFIG.spacing.md;
        baseStyle.paddingHorizontal = THEME_CONFIG.spacing.lg;
        break;
      default:
        baseStyle.paddingVertical = THEME_CONFIG.spacing.sm;
        baseStyle.paddingHorizontal = THEME_CONFIG.spacing.md;
    }

    return [baseStyle, style];
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600',
    };

    return [baseStyle, labelStyle];
  };

  const getMode = (): ButtonProps['mode'] => {
    switch (variant) {
      case 'outline':
        return 'outlined';
      case 'ghost':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getButtonColor = (): string => {
    if (disabled) {
      return colors.neutral.silver;
    }

    switch (variant) {
      case 'secondary':
        return colors.button.secondary;
      case 'outline':
      case 'ghost':
        return colors.button.primary;
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
      case 'outline':
      case 'ghost':
        return colors.button.primaryHover;
      default:
        return colors.button.primaryHover;
    }
  };

  const { backgroundColor, onMouseEnter, onMouseLeave, onPressIn, onPressOut } = useButtonHover(
    getButtonColor(),
    getHoverColor()
  );

  const handlePress = (event: any) => {
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      buttonColor={backgroundColor}
      textColor={
        variant === 'outline' || variant === 'ghost'
          ? colors.button.primary
          : colors.text.inverse
      }
      disabled={disabled}
      loading={loading}
      style={getButtonStyle()}
      labelStyle={getLabelStyle()}
      onPress={handlePress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...props}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: THEME_CONFIG.borderRadius.md,
  },
});

