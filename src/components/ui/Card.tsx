import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/config';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 2,
  padding = 16,
  margin = 0,
  backgroundColor = colors.card.background,
  borderRadius = 8,
}) => {
  const cardStyle = [
    styles.card,
    {
      padding,
      margin,
      backgroundColor,
      borderRadius,
      shadowOpacity: elevation > 0 ? 0.1 : 0,
      shadowRadius: elevation,
      shadowOffset: { width: 0, height: elevation },
    },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    shadowColor: colors.card.shadow,
    elevation: 2,
  },
});
