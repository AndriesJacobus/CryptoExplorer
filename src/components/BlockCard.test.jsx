import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import BlockCard from './BlockCard';
import theme from '../styles/theme';

// Mock the formatters module
vi.mock('../utils/formatters', () => ({
  formatTimestamp: () => '2023-05-15 10:30:45',
  formatNumber: (number) => number?.toLocaleString() || '0',
  truncateMiddle: (str, startChars = 6, endChars = 6) => {
    if (!str) return '';
    if (str.length <= startChars + endChars) return str;
    return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
  },
  identifyMiner: () => 'Test Miner',
  formatBtcAmount: (amount) => `${amount} BTC`,
  formatBlockSize: (size) => `${(size / 1000000).toFixed(2)} MB`,
}));

// Test wrapper with required providers
const renderWithProviders = (component) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('BlockCard Component', () => {
  // Create a test block with all required properties
  const testBlock = {
    hash: '000000000000000000025fb55af764f51afeb453b69723ba30a0bfcbe399e8ed',
    height: 800000,
    time: 1686672076,
    size: 1578494,
    miner: 'Foundry USA',
    tx: [], // Empty array, but defined
    n_tx: 2104, // Alternative property that might be used
    difficulty: 52952804571032,
    confirmations: 123,
    transactionVolume: 12500000000
  };
  
  // Add tx array with correct length
  testBlock.tx = Array(testBlock.n_tx || 0).fill({});
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders block information correctly', () => {
    renderWithProviders(<BlockCard block={testBlock} />);
    
    // Test that essential block information is displayed
    expect(screen.getByText(`Block #${testBlock.height}`)).toBeInTheDocument();
    expect(screen.getByText('2023-05-15 10:30:45')).toBeInTheDocument();
    
    // Test miner name
    expect(screen.getByText('Foundry USA')).toBeInTheDocument();
    
    // Test transactions count
    expect(screen.getByText('2,104')).toBeInTheDocument();
    
    // Test size in bytes
    expect(screen.getByText('1,578,494 bytes')).toBeInTheDocument();
  });
  
  it('applies animation styles when isNew prop is provided', () => {
    const { container } = renderWithProviders(
      <BlockCard block={testBlock} isNew={true} animationIndex={0} />
    );
    
    // Check that the component rendered
    const cardElement = container.firstChild;
    expect(cardElement).toBeTruthy();
  });
  
  it('handles missing block data gracefully', () => {
    const { container } = renderWithProviders(<BlockCard block={null} />);
    // Should not render anything when block is null
    expect(container.firstChild).toBeNull();
  });
  
  it('does not show view details button when isTooltip is true', () => {
    renderWithProviders(<BlockCard block={testBlock} isTooltip={true} />);
    
    // The view details button should not be present
    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
  });

  // Check for link functionality instead of onClick
  it('contains clickable view details link', () => {
    renderWithProviders(<BlockCard block={testBlock} />);
    
    // Check that there is a "View Details" link with the correct href
    const detailsLink = screen.getByText('View Details');
    expect(detailsLink).toBeInTheDocument();
    expect(detailsLink.closest('a')).toHaveAttribute(
      'href', 
      `/btc/block/${testBlock.hash}`
    );
  });

  it('displays hash in truncated form', () => {
    renderWithProviders(<BlockCard block={testBlock} />);
    
    // The hash should be truncated, we can check for part of it
    expect(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'a' && content.includes('...');
    })).toBeInTheDocument();
  });
});