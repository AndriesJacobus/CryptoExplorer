import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from 'styled-components';
import CryptoPriceCard from './CryptoPriceCard';
import theme from '../styles/theme';
import * as formatters from '../utils/formatters';

// Mock formatters
vi.mock('../utils/formatters', () => ({
  formatNumber: vi.fn(number => number.toLocaleString())
}));

// Helper function to render with theme
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>
  );
};

describe('CryptoPriceCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCrypto = {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 50000,
    change24h: 5.25,
    marketCap: 950000000000,
    logo: 'https://example.com/bitcoin-logo.png'
  };

  it('renders cryptocurrency information correctly', () => {
    const { container } = renderWithTheme(<CryptoPriceCard crypto={mockCrypto} />);
    
    // Check that name and symbol are displayed
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    
    // Check that price is displayed with proper formatting
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(formatters.formatNumber).toHaveBeenCalledWith(50000);
    
    // Check that price change is displayed correctly with up arrow
    expect(screen.getByText('↑ 5.25%')).toBeInTheDocument();
    
    // Check that market cap is displayed
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('$950,000,000,000')).toBeInTheDocument();
    expect(formatters.formatNumber).toHaveBeenCalledWith(950000000000);
    
    // Check that logo is displayed with correct attributes
    // Using querySelector since the image has an empty alt attribute
    const logo = container.querySelector('img');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/bitcoin-logo.png');
    expect(logo).toHaveAttribute('alt', '');
  });

  it('displays negative price change correctly', () => {
    const negativeCrypto = {
      ...mockCrypto,
      change24h: -3.75
    };
    
    renderWithTheme(<CryptoPriceCard crypto={negativeCrypto} />);
    
    // Check that price change is displayed correctly with down arrow
    const priceChangeElement = screen.getByText('↓ 3.75%');
    expect(priceChangeElement).toBeInTheDocument();
    
    // Check that it has the error color for negative change
    expect(priceChangeElement).toHaveStyle(`color: ${theme.colors.error}`);
  });

  it('handles missing logo gracefully', () => {
    const noLogoCrypto = {
      ...mockCrypto,
      logo: undefined
    };
    
    renderWithTheme(<CryptoPriceCard crypto={noLogoCrypto} />);
    
    // Check that the component renders without errors despite missing logo
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    
    // Logo should not be in the document
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies animation styles for new crypto cards', () => {
    const { container } = renderWithTheme(
      <CryptoPriceCard crypto={mockCrypto} isNew={true} animationIndex={0} />
    );
    
    // Check if it has border-left style applied (indicating it's a new card)
    const cardContainer = container.firstChild;
    expect(cardContainer).toHaveStyle(`border-left: 4px solid ${theme.colors.primary}`);
  });

  it('handles very large numbers with proper formatting', () => {
    const largePriceCrypto = {
      ...mockCrypto,
      price: 1234567890.12345,
      marketCap: 9876543210987654
    };
    
    renderWithTheme(<CryptoPriceCard crypto={largePriceCrypto} />);
    
    // Check that large numbers are formatted properly
    // Using a partial match since the actual formatting may truncate decimals
    expect(screen.getByText(/\$1,234,567,890/)).toBeInTheDocument();
    expect(screen.getByText('$9,876,543,210,987,654')).toBeInTheDocument();
    
    // Check that formatNumber was called with the right values
    expect(formatters.formatNumber).toHaveBeenCalledWith(1234567890.12345);
    expect(formatters.formatNumber).toHaveBeenCalledWith(9876543210987654);
  });

  it('renders without crashing with minimal props', () => {
    const minimalCrypto = {
      name: 'Minimal Coin',
      symbol: 'MIN',
      price: 1.0,
      change24h: 0,
      marketCap: 1000000
    };
    
    renderWithTheme(<CryptoPriceCard crypto={minimalCrypto} />);
    
    // Check that the component renders with minimal data
    expect(screen.getByText('Minimal Coin')).toBeInTheDocument();
    expect(screen.getByText('MIN')).toBeInTheDocument();
    
    // Check that zero price change is displayed with up arrow (since it's not negative)
    expect(screen.getByText('↑ 0.00%')).toBeInTheDocument();
  });
});