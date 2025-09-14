import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/config';

interface ClockIconProps {
  size?: number;
  style?: ViewStyle;
  backgroundColor?: string;
  iconColor?: string;
}

export const ClockIcon: React.FC<ClockIconProps> = ({
  size = 56,
  backgroundColor = colors.button.primary,
  iconColor = colors.text.inverse,
  style,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <MaterialIcons 
        name="timer" 
        size={size * 0.6} 
        color={iconColor} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
