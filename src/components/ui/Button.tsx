import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { THEME_CONFIG } from '@/config/app';

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
      return THEME_CONFIG.colors.textDisabled;
    }

    switch (variant) {
      case 'secondary':
        return THEME_CONFIG.colors.secondary;
      case 'outline':
      case 'ghost':
        return THEME_CONFIG.colors.primary;
      default:
        return THEME_CONFIG.colors.primary;
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      buttonColor={getButtonColor()}
      textColor={
        variant === 'outline' || variant === 'ghost'
          ? THEME_CONFIG.colors.primary
          : '#ffffff'
      }
      disabled={disabled}
      loading={loading}
      style={getButtonStyle()}
      labelStyle={getLabelStyle()}
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

