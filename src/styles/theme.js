// Theme configuration for styled-components
const theme = {
  colors: {
    primary: '#1260E6', // Main blue color
    secondary: '#131B2E', // Dark blue for backgrounds
    tertiary: '#2E4476', // Medium blue for secondary elements
    white: '#FFFFFF',
    lightGray: '#F8F8F8',
    gray: '#DADADA',
    darkGray: '#666666',
    text: '#333333',
    textLight: '#666666',
    background: '#FFFFFF',
    backgroundLight: '#F8F8F8',
    border: '#DADADA',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    primaryDark: '#0D47A1',
  },
  fonts: {
    main: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  fontSizes: {
    tiny: '0.75rem',
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
    xxlarge: '2rem',
  },
  breakpoints: {
    mobile: '600px',
    tablet: '1024px',
    desktop: '1200px',
  },
  spacing: {
    tiny: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xlarge: '2rem',
    xxlarge: '3rem',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    circle: '50%',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
    large: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
};

export default theme;
