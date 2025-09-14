/**
 * Color system based on the todoify_logo.png
 * 
 * Main Orange: #ed752b (237, 117, 43) - Dominant color of the notepad cover
 * White: #ffffff (255, 255, 255) - Checkmark and "todoify" text
 * Silver/Gray: #bababa (186, 186, 186) - Metallic spiral binding
 * Cream/Beige: #f2e3cb (242, 227, 203) - Paper under curled corner
 * Dark Orange/Brown: #bd5e26 (189, 94, 38) - Underside of curled page corner
 */

export const colors = {
  // Primary colors from logo
  primary: {
    main: '#ed752b',      // Main orange
    dark: '#bd5e26',      // Dark orange/brown
    light: '#f2e3cb',     // Cream/beige
  },
  
  // Neutral colors
  neutral: {
    white: '#ffffff',     // Pure white
    silver: '#bababa',    // Silver/gray
    light: '#f8fafc',     // Light background
    medium: '#64748b',    // Medium gray for text
    dark: '#1e293b',      // Dark text
  },
  
  // Semantic colors using logo palette
  success: '#10b981',     // Green for completed tasks
  warning: '#f59e0b',     // Amber for warnings
  error: '#ef4444',       // Red for errors
  info: '#6366f1',        // Blue for information
  
  // Background colors
  background: {
    primary: '#ffffff',   // White background
    secondary: '#f8fafc', // Light gray background
    tertiary: '#f2e3cb',  // Cream background
    dark: '#0f172a',      // Dark background for focus mode
  },
  
  // Text colors
  text: {
    primary: '#1e293b',   // Dark text
    secondary: '#64748b', // Medium gray text
    tertiary: '#94a3b8',  // Light gray text
    inverse: '#ffffff',   // White text
  },
  
  // Border colors
  border: {
    light: '#e2e8f0',     // Light border
    medium: '#cbd5e1',    // Medium border
    dark: '#bababa',      // Silver border
  },
  
  // Button colors
  button: {
    primary: '#ed752b',   // Main orange button
    primaryHover: '#bd5e26', // Darker orange on hover
    secondary: '#f2e3cb', // Cream button
    secondaryHover: '#e5d4b8', // Darker cream on hover
    danger: '#ef4444',    // Red button
    success: '#10b981',   // Green button
  },
  
  // Card colors
  card: {
    background: '#ffffff',
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Focus mode colors
  focus: {
    background: '#0f172a',    // Dark background
    primary: '#ed752b',       // Orange accent
    text: '#ffffff',          // White text
    secondary: '#94a3b8',     // Light gray text
  }
} as const;

export type ColorKey = keyof typeof colors;
export type ColorValue = typeof colors[ColorKey];
