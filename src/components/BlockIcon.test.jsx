import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from 'styled-components';
import BlockIcon from './BlockIcon';
import theme from '../styles/theme';

// Helper function to render with theme
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>
  );
};

describe('BlockIcon Component', () => {
  it('renders the Bitcoin symbol correctly', () => {
    renderWithTheme(<BlockIcon />);
    
    // Check that the Bitcoin symbol is displayed
    expect(screen.getByText('₿')).toBeInTheDocument();
  });

  it('renders with default size when no size prop is provided', () => {
    const { container } = renderWithTheme(<BlockIcon />);
    
    // The first child should be the IconContainer div
    const iconContainer = container.firstChild;
    
    // Check that the default size is applied
    expect(iconContainer).toHaveStyle('width: 48px');
    expect(iconContainer).toHaveStyle('height: 48px');
  });

  it('renders with custom size when size prop is provided', () => {
    const customSize = 64;
    const { container } = renderWithTheme(<BlockIcon size={customSize} />);
    
    // The first child should be the IconContainer div
    const iconContainer = container.firstChild;
    
    // Check that the custom size is applied
    expect(iconContainer).toHaveStyle(`width: ${customSize}px`);
    expect(iconContainer).toHaveStyle(`height: ${customSize}px`);
  });

  it('renders with the correct styling', () => {
    const { container } = renderWithTheme(<BlockIcon />);
    
    // The first child should be the IconContainer div
    const iconContainer = container.firstChild;
    
    // Check that the styling is correctly applied
    expect(iconContainer).toHaveStyle('background-color: #F7931A'); // Bitcoin orange color
    expect(iconContainer).toHaveStyle('border-radius: 50%'); // Circular shape
    
    // Check that the inner Bitcoin symbol has the correct styling
    const bitcoinSymbol = screen.getByText('₿');
    expect(bitcoinSymbol).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('applies theme-based font size to the Bitcoin symbol', () => {
    renderWithTheme(<BlockIcon />);
    
    // Check that the Bitcoin symbol has a font size based on the theme
    const bitcoinSymbol = screen.getByText('₿');
    
    // Check that some font-size is applied (using the actual rendered value)
    expect(bitcoinSymbol).toHaveStyle('font-size: 2.5rem');
  });
});