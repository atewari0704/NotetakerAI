import { useState, useCallback } from 'react';

interface HoverState {
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
}

/**
 * Custom hook for handling hover effects in React Native
 * Uses onMouseEnter/onMouseLeave for true hover effects
 * Falls back to onPressIn/onPressOut for touch devices
 */
export const useHover = (): HoverState => {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const onPressIn = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onPressOut = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered,
    onMouseEnter,
    onMouseLeave,
    onPressIn,
    onPressOut,
  };
};

/**
 * Hook for button hover effects with color variations
 */
export const useButtonHover = (baseColor: string, hoverColor: string) => {
  const { isHovered, onMouseEnter, onMouseLeave, onPressIn, onPressOut } = useHover();
  
  const backgroundColor = isHovered ? hoverColor : baseColor;
  
  return {
    isHovered,
    backgroundColor,
    onMouseEnter,
    onMouseLeave,
    onPressIn,
    onPressOut,
  };
};
