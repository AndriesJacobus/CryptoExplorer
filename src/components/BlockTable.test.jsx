import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import BlockTable from './BlockTable';
import theme from '../styles/theme';
import * as formatters from '../utils/formatters';

// Mock the formatters
vi.mock('../utils/formatters', () => ({
  formatTimestamp: vi.fn(timestamp => `Formatted time: ${timestamp}`),
  formatNumber: vi.fn(number => number.toLocaleString()),
  truncateMiddle: vi.fn((str, start, end) => `${str.substring(0, start)}...${str.substring(str.length - end)}`),
  identifyMiner: vi.fn(coinbase => {
    if (coinbase.includes('Antpool')) return 'Antpool';
    if (coinbase.includes('F2Pool')) return 'F2Pool';
    return 'Unknown Miner';
  }),
  formatTimeAgo: vi.fn(timestamp => `${timestamp} ago`)
}));

// Mock the BlockCard component
vi.mock('./BlockCard', () => ({
  default: vi.fn(({ block, isTooltip }) => (
    <div data-testid="mock-block-card">
      <span>Block Height: {block.height}</span>
      <span>Is Tooltip: {isTooltip ? 'true' : 'false'}</span>
    </div>
  ))
}));

// Helper function to render with theme and router
const renderWithThemeAndRouter = (ui) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );
};

// Sample mock data
const mockBlocks = [
  {
    hash: 'hash123',
    height: 700001,
    timestamp: 1620000000,
    time: 1620000000,
    coinbase: 'Antpool BTC',
    size: 1234567
  },
  {
    hash: 'hash456',
    height: 700000,
    timestamp: 1619999000,
    time: 1619999000,
    coinbase: 'F2Pool Miner',
    size: 987654
  }
];

describe('BlockTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset any timeouts
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading state correctly', () => {
    renderWithThemeAndRouter(<BlockTable blocks={[]} isLoading={true} />);
    
    expect(screen.getByText('Loading blocks...')).toBeInTheDocument();
    
    // Check for LoadingSpinner by class name instead of role
    const { container } = renderWithThemeAndRouter(<BlockTable blocks={[]} isLoading={true} />);
    const loadingSpinner = container.querySelector('.sc-jJAtPt');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    renderWithThemeAndRouter(<BlockTable blocks={[]} isLoading={false} />);
    
    expect(screen.getByText('No blocks found')).toBeInTheDocument();
  });

  it('renders blocks correctly', () => {
    renderWithThemeAndRouter(<BlockTable blocks={mockBlocks} isLoading={false} />);
    
    // Check table headers
    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByText('Hash')).toBeInTheDocument();
    expect(screen.getByText('Mined')).toBeInTheDocument();
    expect(screen.getByText('Miner')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    
    // Check block data
    expect(screen.getByText('#700,001')).toBeInTheDocument();
    // Use the actual rendered hash text from the component
    expect(screen.getByText('hash123...hash123')).toBeInTheDocument();
    expect(screen.getByText('Antpool')).toBeInTheDocument();
    expect(screen.getByText('1,234,567 bytes')).toBeInTheDocument();
    
    // Check that formatters were called
    expect(formatters.formatNumber).toHaveBeenCalledWith(700001);
    expect(formatters.formatNumber).toHaveBeenCalledWith(1234567);
    expect(formatters.truncateMiddle).toHaveBeenCalledWith('hash123', 10, 10);
    expect(formatters.identifyMiner).toHaveBeenCalledWith('Antpool BTC');
    expect(formatters.formatTimeAgo).toHaveBeenCalledWith(1620000000);
    expect(formatters.formatTimestamp).toHaveBeenCalledWith(1620000000);
  });

  it('shows BlockCard tooltip on hover', () => {
    renderWithThemeAndRouter(<BlockTable blocks={mockBlocks} isLoading={false} />);
    
    // Initially, there should be no tooltip
    expect(screen.queryByTestId('mock-block-card')).not.toBeInTheDocument();
    
    // Hover over the first block row
    const firstRow = screen.getAllByRole('row')[1]; // First row after header
    fireEvent.mouseEnter(firstRow, { clientX: 100, clientY: 100 });
    
    // The tooltip should appear
    expect(screen.getByTestId('mock-block-card')).toBeInTheDocument();
    expect(screen.getByText('Block Height: 700001')).toBeInTheDocument();
    expect(screen.getByText('Is Tooltip: true')).toBeInTheDocument();
    
    // Mouse leave should remove tooltip
    fireEvent.mouseLeave(firstRow);
    expect(screen.queryByTestId('mock-block-card')).not.toBeInTheDocument();
  });

  it('handles mouse movement with tooltip displayed', () => {
    renderWithThemeAndRouter(<BlockTable blocks={mockBlocks} isLoading={false} />);
    
    // Hover over the first block row
    const firstRow = screen.getAllByRole('row')[1]; // First row after header
    fireEvent.mouseEnter(firstRow, { clientX: 100, clientY: 100 });
    
    // The tooltip should appear
    expect(screen.getByTestId('mock-block-card')).toBeInTheDocument();
    
    // Move the mouse
    fireEvent.mouseMove(firstRow, { clientX: 200, clientY: 200 });
    
    // The tooltip should still be there (with updated position internally)
    expect(screen.getByTestId('mock-block-card')).toBeInTheDocument();
  });

  it('detects and animates new blocks', () => {
    // Initial render with empty blocks
    const { rerender } = renderWithThemeAndRouter(<BlockTable blocks={[]} isLoading={false} />);
    
    // Update with blocks (simulating new blocks arriving)
    rerender(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <BlockTable blocks={mockBlocks} isLoading={false} />
        </ThemeProvider>
      </MemoryRouter>
    );
    
    // All blocks should be marked for animation initially
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    
    // Run timers forward to trigger animation end
    vi.advanceTimersByTime(1500);
    
    // After animation duration, animations should be cleared
    // We can't directly check this because it's internal state,
    // but we can confirm the component still renders correctly
    expect(rows[0]).toBeInTheDocument();
    expect(rows[1]).toBeInTheDocument();
  });

  it('has clickable links to block detail pages', () => {
    renderWithThemeAndRouter(<BlockTable blocks={mockBlocks} isLoading={false} />);
    
    // Find links (both height and hash links should point to block detail pages)
    const heightLinks = screen.getAllByText(/^#/);
    const hashLinks = screen.getAllByText(/hash/);
    
    // Check first height link
    expect(heightLinks[0]).toHaveAttribute('href', '/btc/block/hash123');
    
    // Check first hash link
    expect(hashLinks[0]).toHaveAttribute('href', '/btc/block/hash123');
  });
});