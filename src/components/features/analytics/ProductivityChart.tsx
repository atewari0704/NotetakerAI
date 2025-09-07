import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { Card } from '@/components/ui';

interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

interface ProductivityChartProps {
  title: string;
  data: ChartDataPoint[];
  type: 'focus_time' | 'sessions' | 'tasks' | 'productivity_score';
  period: 'week' | 'month';
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  title,
  data,
  type,
  period,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32; // Account for padding
  const maxValue = Math.max(...data.map(d => d.value), 1);

  const getBarColor = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#3b82f6'; // Blue
    if (percentage >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const formatValue = (value: number): string => {
    switch (type) {
      case 'focus_time':
        return `${value}m`;
      case 'sessions':
        return `${value}`;
      case 'tasks':
        return `${value}`;
      case 'productivity_score':
        return `${value.toFixed(1)}`;
      default:
        return `${value}`;
    }
  };

  const getYAxisLabel = (): string => {
    switch (type) {
      case 'focus_time':
        return 'Minutes';
      case 'sessions':
        return 'Sessions';
      case 'tasks':
        return 'Tasks';
      case 'productivity_score':
        return 'Score';
      default:
        return '';
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Chart Area */}
      <View style={styles.chartContainer}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{formatValue(maxValue)}</Text>
          <Text style={styles.yAxisLabel}>{formatValue(maxValue * 0.75)}</Text>
          <Text style={styles.yAxisLabel}>{formatValue(maxValue * 0.5)}</Text>
          <Text style={styles.yAxisLabel}>{formatValue(maxValue * 0.25)}</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>

        {/* Chart Bars */}
        <View style={styles.chartArea}>
          {data.map((point, index) => {
            const barHeight = (point.value / maxValue) * 120; // Max height 120
            const barWidth = (chartWidth - 40) / data.length - 4; // Account for spacing
            
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 2), // Minimum 2px height
                      width: barWidth,
                      backgroundColor: getBarColor(point.value, maxValue),
                    },
                  ]}
                />
                <Text style={styles.xAxisLabel}>{point.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* X-Axis Label */}
      <Text style={styles.xAxisTitle}>
        {period === 'week' ? 'Days of Week' : 'Weeks of Month'}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 160,
    marginBottom: 8,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    borderRadius: 2,
    marginBottom: 4,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  xAxisTitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
});
