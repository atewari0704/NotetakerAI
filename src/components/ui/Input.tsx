import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import { THEME_CONFIG } from '@/config/app';

interface CustomInputProps extends Omit<TextInputProps, 'mode'> {
  variant?: 'outlined' | 'filled' | 'flat';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<CustomInputProps> = ({
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  error = false,
  helperText,
  style,
  inputStyle,
  disabled,
  ...props
}) => {
  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: THEME_CONFIG.borderRadius.md,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (size) {
      case 'small':
        baseStyle.paddingVertical = THEME_CONFIG.spacing.xs;
        break;
      case 'large':
        baseStyle.paddingVertical = THEME_CONFIG.spacing.md;
        break;
      default:
        baseStyle.paddingVertical = THEME_CONFIG.spacing.sm;
    }

    return [baseStyle, style];
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
    };

    return [baseStyle, inputStyle];
  };

  const getOutlineColor = (): string => {
    if (error) {
      return THEME_CONFIG.colors.error;
    }
    if (disabled) {
      return THEME_CONFIG.colors.textDisabled;
    }
    return THEME_CONFIG.colors.primary;
  };

  return (
    <TextInput
      mode={variant}
      style={getInputStyle()}
      contentStyle={getTextStyle()}
      outlineColor={getOutlineColor()}
      activeOutlineColor={THEME_CONFIG.colors.primary}
      disabled={disabled}
      error={error}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: THEME_CONFIG.borderRadius.md,
  },
});

