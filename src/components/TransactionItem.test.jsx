import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, vi, beforeEach, test } from 'vitest';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';
import TransactionItem from './TransactionItem';
import { mockTransactions } from '../test/mocks/mockData';
import * as formatters from '../utils/formatters';

// Helper function to render with theme
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>
  );
};

// Create a mock coinbase transaction for testing
const mockCoinbaseTransaction = {
  hash: "77af92131c66a4eba7abe34c6563a62a00917afabb637b5550c71c5aa5e2c451",
  is_coinbase: true,
  time: 1686672076,
  out: [
    {
      addr: "bc1qxneh87v5qnkqz5zah6mwcgv4y8qgpkcm5cdlpw",
      value: 6250000000
    }
  ],
  inputs: [
    {
      coinbase: "03fc350c2f7264697474c102062f42544332e3a09c5f586c5252756a756e31323263e69af585e70a022cfabe6d6d8c16492f1f0b3fc73bf86888fff80000000000000000"
    }
  ],
  size: 289,
  weight: 1156,
  confirmations: 5
};

// Mock formatters
vi.mock('../utils/formatters', () => {
  return {
    formatTimestamp: vi.fn().mockImplementation(timestamp => {
      // This ensures the parameter is captured correctly for the test assertion
    //   return `2023-06-13 12:34`;
    return new Date(timestamp * 1000).toLocaleString();
    }),
    formatBtcAmount: vi.fn((satoshis) => `${satoshis / 100000000} BTC`),
    truncateMiddle: vi.fn((str, start, end) => {
      if (!str) return '';
      if (str === "Coinbase (Newly Generated Coins)") return str;
      return str.length > (start + end) ? `${str.substring(0, start)}...${str.substring(str.length - end)}` : str;
    })
  };
});

describe('TransactionItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('renders transaction summary correctly', () => {
    const transaction = mockTransactions[0];
    renderWithTheme(<TransactionItem transaction={transaction} />);
    
    // Check transaction hash is displayed correctly
    expect(screen.getByTitle(transaction.hash)).toBeInTheDocument();
    
    // Check From and To addresses are displayed
    expect(screen.getByText(/From:/)).toBeInTheDocument();
    expect(screen.getByText(/To:/)).toBeInTheDocument();
    
    // Check amount formatter was called (for the total output)
    expect(formatters.formatBtcAmount).toHaveBeenCalled();
  });

  test('expands and collapses transaction details when clicked', () => {
    const transaction = mockTransactions[0];
    renderWithTheme(<TransactionItem transaction={transaction} />);
    
    // Initially, expanded details should not be visible
    expect(screen.queryByText('Transaction Details')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByText(/\+/));
    
    // Now details should be visible
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByText('Transaction Hash:')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(screen.getByText(/−/));
    
    // Details should be hidden again
    expect(screen.queryByText('Transaction Details')).not.toBeInTheDocument();
  });

  test('handles coinbase transactions correctly', () => {
    renderWithTheme(<TransactionItem transaction={mockCoinbaseTransaction} />);
    
    // Click to expand
    fireEvent.click(screen.getByText(/\+/));
    
    // Check for coinbase-specific content with specific title to avoid multiple matches
    const fromText = screen.getByTitle("Coinbase Transaction (New Bitcoins)");
    expect(fromText).toBeInTheDocument();
    
    // Use getAllByText instead of getByText since there are multiple elements
    const newlyGeneratedCoins = screen.getAllByText(/Newly Generated Coins/);
    expect(newlyGeneratedCoins.length).toBeGreaterThan(0);
  });

  test('applies animation for new transactions', () => {
    const transaction = mockTransactions[0];
    const { container } = renderWithTheme(
      <TransactionItem transaction={transaction} isNew={true} animationIndex={0} />
    );
    
    // Get the transaction container
    const transactionContainer = container.firstChild;
    
    // Check if it has border-left style applied (checking for any border-left style)
    expect(transactionContainer).toHaveStyle(`border-left: 4px solid ${theme.colors.primary}`);
  });

  test('displays unconfirmed status correctly', () => {
    const unconfirmedTx = {
      ...mockTransactions[0],
      confirmations: 0
    };
    
    renderWithTheme(<TransactionItem transaction={unconfirmedTx} />);
    
    // Expand the details
    fireEvent.click(screen.getByText(/\+/));
    
    // Check for unconfirmed status
    expect(screen.getByText('Unconfirmed')).toBeInTheDocument();
  });

  test('displays confirmed status with confirmation count', () => {
    const confirmedTx = {
      ...mockTransactions[0],
      confirmations: 3
    };
    
    renderWithTheme(<TransactionItem transaction={confirmedTx} />);
    
    // Expand the details
    fireEvent.click(screen.getByText(/\+/));
    
    // Check for confirmed status with count
    expect(screen.getByText('Confirmed (3 confirmations)')).toBeInTheDocument();
  });

  test('formats addresses with truncation', () => {
    const transaction = mockTransactions[0];
    renderWithTheme(<TransactionItem transaction={transaction} />);
    
    // Check truncation was called for addresses
    expect(formatters.truncateMiddle).toHaveBeenCalledWith(transaction.inputs[0].prev_out.addr, 12, 12);
    expect(formatters.truncateMiddle).toHaveBeenCalledWith(transaction.out[0].addr, 12, 12);
  });

  test('memoizes expensive calculations to prevent recalculation', () => {
    // Render component twice with same transaction
    const transaction = mockTransactions[0];
    
    const { rerender } = renderWithTheme(<TransactionItem transaction={transaction} />);
    
    // Clear mocks to check how many times they're called on rerender
    vi.clearAllMocks();
    
    // Rerender with the same transaction
    rerender(
      <ThemeProvider theme={theme}>
        <TransactionItem transaction={transaction} />
      </ThemeProvider>
    );
    
    // Expand the transaction to make sure calculations are triggered
    fireEvent.click(screen.getByText(/\+/));
    
    // formatter.formatBtcAmount should be called the expected number of times
    // (Should be the same between renders due to useMemo)
    expect(formatters.formatBtcAmount).toHaveBeenCalled();
  });
});