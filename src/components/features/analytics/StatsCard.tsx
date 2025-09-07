import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  onPress?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#6366f1',
  onPress,
  trend,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={[styles.container, onPress && styles.pressable]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>
      
      <Text style={[styles.value, { color }]}>{value}</Text>
      
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      
      {trend && (
        <View style={styles.trend}>
          <Text style={[styles.trendText, { color: trend.isPositive ? '#10b981' : '#ef4444' }]}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </Text>
          <Text style={styles.trendLabel}>vs last week</Text>
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
    minHeight: 100,
  },
  pressable: {
    // Add press effect styles if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    flex: 1,
  },
  icon: {
    fontSize: 20,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
});
