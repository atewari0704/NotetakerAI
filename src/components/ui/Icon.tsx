import React from 'react';
import { View, StyleSheet, ViewStyle, Image, ImageSourcePropType } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

interface LogoProps {
  size?: number;
  style?: ViewStyle;
}

export const TodoifyIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#FF6B35', // Orange color matching the logo
  style 
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background with subtle gradient shadow */}
        <Rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="#F5F5F5"
        />
        
        {/* Main notebook with rounded corners and 3D effect */}
        <Rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="20"
          ry="20"
          fill={color}
          stroke="#E55A2B"
          strokeWidth="0.5"
        />
        
        {/* 3D shadow effect */}
        <Rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="18"
          ry="18"
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Spiral binding rings - 5 metallic rings */}
        <G>
          {[0, 1, 2, 3, 4].map((i) => (
            <G key={i}>
              {/* Ring shadow */}
              <Circle
                cx="15"
                cy={18 + i * 14}
                r="4"
                fill="rgba(0,0,0,0.2)"
              />
              {/* Main ring */}
              <Circle
                cx="15"
                cy={18 + i * 14}
                r="3.5"
                fill="#C0C0C0"
                stroke="#A0A0A0"
                strokeWidth="0.3"
              />
              {/* Ring highlight */}
              <Circle
                cx="15"
                cy={18 + i * 14}
                r="2.5"
                fill="#E8E8E8"
              />
            </G>
          ))}
        </G>
        
        {/* Large checkmark - thick and bold */}
        <Path
          d="M40 30 L50 40 L75 15"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* "todoify" text - clean sans-serif */}
        <G>
          <Path
            d="M25 65 Q30 60 35 65 Q40 70 45 65 Q50 60 55 65 Q60 70 65 65 Q70 60 75 65"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M25 70 Q30 75 35 70 Q40 65 45 70 Q50 75 55 70 Q60 65 65 70 Q70 75 75 70"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </G>
        
        {/* Curled page corner - more detailed */}
        <Path
          d="M75 75 Q85 75 85 85 Q75 85 75 75"
          fill="#F5F5DC"
          stroke="#D0D0D0"
          strokeWidth="0.5"
        />
        
        {/* Inner curl detail */}
        <Path
          d="M78 78 Q82 78 82 82 Q78 82 78 78"
          fill="#E8E8E8"
        />
        
        {/* Shadow for curled corner */}
        <Path
          d="M75 75 Q85 75 85 85 Q75 85 75 75"
          fill="rgba(0,0,0,0.15)"
          transform="translate(1.5, 1.5)"
        />
        
        {/* Subtle sparkle in background */}
        <G>
          <Path
            d="M85 85 L87 87 L85 89 L83 87 Z"
            fill="rgba(255,255,255,0.3)"
          />
          <Path
            d="M88 88 L90 90 L88 92 L86 90 Z"
            fill="rgba(255,255,255,0.2)"
          />
        </G>
      </Svg>
    </View>
  );
};

export const AppIcon: React.FC<IconProps> = ({ 
  size = 40, 
  color = '#FF6B35',
  style 
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background with subtle gradient shadow */}
        <Rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="#F5F5F5"
        />
        
        {/* Main notebook with rounded corners and 3D effect */}
        <Rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="20"
          ry="20"
          fill={color}
          stroke="#E55A2B"
          strokeWidth="0.5"
        />
        
        {/* 3D shadow effect */}
        <Rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="18"
          ry="18"
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Spiral binding rings - 5 metallic rings */}
        <G>
          {[0, 1, 2, 3, 4].map((i) => (
            <G key={i}>
              {/* Ring shadow */}
              <Circle
                cx="15"
                cy={18 + i * 14}
                r="4"
                fill="rgba(0,0,0,0.2)"
              />
              {/* Main ring */}
              <Circle
                cx="15"
                cy={18 + i * 14}
                r="3.5"
                fill="#C0C0C0"
                stroke="#A0A0A0"
                strokeWidth="0.3"
              />
              {/* Ring highlight */}
              <Circle
                cx="15"
                cy={18 + i * 14}
                r="2.5"
                fill="#E8E8E8"
              />
            </G>
          ))}
        </G>
        
        {/* Large checkmark - thick and bold */}
        <Path
          d="M40 30 L50 40 L75 15"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* "todoify" text - clean sans-serif */}
        <G>
          <Path
            d="M25 65 Q30 60 35 65 Q40 70 45 65 Q50 60 55 65 Q60 70 65 65 Q70 60 75 65"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M25 70 Q30 75 35 70 Q40 65 45 70 Q50 75 55 70 Q60 65 65 70 Q70 75 75 70"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </G>
        
        {/* Curled page corner - more detailed */}
        <Path
          d="M75 75 Q85 75 85 85 Q75 85 75 75"
          fill="#F5F5DC"
          stroke="#D0D0D0"
          strokeWidth="0.5"
        />
        
        {/* Inner curl detail */}
        <Path
          d="M78 78 Q82 78 82 82 Q78 82 78 78"
          fill="#E8E8E8"
        />
        
        {/* Shadow for curled corner */}
        <Path
          d="M75 75 Q85 75 85 85 Q75 85 75 75"
          fill="rgba(0,0,0,0.15)"
          transform="translate(1.5, 1.5)"
        />
        
        {/* Subtle sparkle in background */}
        <G>
          <Path
            d="M85 85 L87 87 L85 89 L83 87 Z"
            fill="rgba(255,255,255,0.3)"
          />
          <Path
            d="M88 88 L90 90 L88 92 L86 90 Z"
            fill="rgba(255,255,255,0.2)"
          />
        </G>
      </Svg>
    </View>
  );
};

// Logo component using the actual PNG file
export const Logo: React.FC<LogoProps> = ({ 
  size = 60, 
  style 
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={require('../../../assets/todoify_logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
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

export default TodoifyIcon;
