import React from 'react';
import { TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TaskIconProps {
  name: 'calendar' | 'flag';
  size?: number;
  color?: string;
  style?: TextStyle;
}

export const TaskIcon: React.FC<TaskIconProps> = ({ name, size = 16, color = '#666', style }) => {
  switch (name) {
    case 'calendar':
      return <Ionicons name="calendar-outline" size={size} color={color} style={style} />;
    case 'flag':
      return <Ionicons name="flag-outline" size={size} color={color} style={style} />;
    default:
      return <Ionicons name="help-outline" size={size} color={color} style={style} />;
  }
};
