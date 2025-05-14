import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';
import TransactionList from './TransactionList';
import blockchainService from '../services/api/blockchainService';

// Mock the blockchainService module
vi.mock('../services/api/blockchainService', () => ({
  default: {
    getTransactionsByIds: vi.fn()
  }
}));

// Setup a wrapper with QueryClientProvider for all tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
});

const renderWithClient = (ui) => {
  const testQueryClient = createTestQueryClient();
  const { rerender, ...result } = render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
    </ThemeProvider>
  );
  return {
    ...result,
    rerender: (rerenderUi) =>
      rerender(
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={testQueryClient}>{rerenderUi}</QueryClientProvider>
        </ThemeProvider>
      ),
  };
};

describe('TransactionList Component', () => {
  const mockTransactionHashes = [
    'tx1', 'tx2', 'tx3', 'tx4', 'tx5', 'tx6', 'tx7', 'tx8', 'tx9', 'tx10',
    'tx11', 'tx12', 'tx13', 'tx14', 'tx15'
  ];

  const createMockTransaction = (id) => ({
    txid: id,
    hash: id,
    time: 1684123456 + parseInt(id.replace('tx', ''), 10) - 1,
    inputs: [],
    out: []
  });

  beforeEach(() => {
    // Reset the mock functions
    vi.resetAllMocks();
    
    // Set default mock implementation that resolves immediately
    blockchainService.getTransactionsByIds.mockImplementation(async (hashes) => {
      return hashes.map(createMockTransaction);
    });
  });

  test('renders loading state when fetching initial transactions', () => {
    // Mock the API to delay returning data
    blockchainService.getTransactionsByIds.mockImplementation(async () => {
      // Never resolve in this test to keep the loading state
      return new Promise(() => {});
    });

    renderWithClient(<TransactionList transactionHashes={mockTransactionHashes.slice(0, 10)} />);
    
    // Initial loading state
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  test('renders transactions after loading', async () => {
    renderWithClient(<TransactionList transactionHashes={mockTransactionHashes.slice(0, 10)} />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    });

    // Check that transaction data is rendered
    await waitFor(() => {
      expect(screen.getByTestId('transaction-tx1')).toBeInTheDocument();
    });
  });

  test('displays proper transaction count', async () => {
    renderWithClient(<TransactionList transactionHashes={mockTransactionHashes.slice(0, 10)} />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    });

    // Check for transaction count text
    await waitFor(() => {
      expect(screen.getByText('Showing 10 of 10 transactions')).toBeInTheDocument();
    });
  });

  test('has a Load More button when more transactions exist', async () => {
    renderWithClient(<TransactionList 
      transactionHashes={mockTransactionHashes} 
      initialCount={10}
    />);
    
    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    });

    // Look for the Load More button
    await waitFor(() => {
      const loadMoreButton = screen.getByRole('button', { name: /load more/i });
      expect(loadMoreButton).toBeInTheDocument();
    });
  });

  test('calls the blockchain service with the correct transaction IDs', async () => {
    renderWithClient(<TransactionList transactionHashes={mockTransactionHashes.slice(0, 10)} />);
    
    // Wait for the API call to be made
    await waitFor(() => {
      expect(blockchainService.getTransactionsByIds).toHaveBeenCalled();
    });
    
    // Check that the API was called with the correct transaction hashes
    expect(blockchainService.getTransactionsByIds).toHaveBeenCalledWith(mockTransactionHashes.slice(0, 10));
  });

  test('loads more transactions when Load More button is clicked', async () => {
    blockchainService.getTransactionsByIds.mockImplementation(async (hashes) => {
      return hashes.map(createMockTransaction);
    });

    renderWithClient(<TransactionList 
      transactionHashes={mockTransactionHashes} 
      initialCount={10}
    />);
    
    // Wait for the initial transactions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    });
    
    // Initial state shows 10 transactions
    await waitFor(() => {
      expect(screen.getByText('Showing 10 of 15 transactions')).toBeInTheDocument();
    });
    
    // Set up next API call response to include all 15 transactions
    blockchainService.getTransactionsByIds.mockImplementation(async (hashes) => {
      return hashes.map(createMockTransaction);
    });
    
    // Click the load more button
    const loadMoreButton = await screen.findByRole('button', { name: /load more transactions/i });
    fireEvent.click(loadMoreButton);
    
    // Wait for the additional transactions to be loaded
    await waitFor(() => {
      // Should now show 15 transactions (all of them)
      expect(screen.getByText('Showing 15 of 15 transactions')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Should have made a second API call
    expect(blockchainService.getTransactionsByIds).toHaveBeenCalledTimes(2);
  });

  test('shows an error message when the transaction fetch fails', async () => {
    // Mock the API to fail
    blockchainService.getTransactionsByIds.mockRejectedValue(new Error('Failed to fetch transactions'));

    renderWithClient(<TransactionList transactionHashes={mockTransactionHashes.slice(0, 10)} />);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message-container')).toBeInTheDocument();
      expect(screen.getByTestId('error-message-text')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('handles empty transaction array gracefully', async () => {
    blockchainService.getTransactionsByIds.mockResolvedValue([]);

    renderWithClient(<TransactionList transactionHashes={[]} />);
    
    // Should not render anything for empty hashes
    expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    expect(screen.queryByText(/no transactions/i)).not.toBeInTheDocument();
  });

  test('shows no transactions message when API returns empty', async () => {
    blockchainService.getTransactionsByIds.mockResolvedValue([]);

    renderWithClient(<TransactionList transactionHashes={mockTransactionHashes.slice(0, 3)} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    });
    
    // Should show no transactions message
    await waitFor(() => {
      expect(screen.getByTestId('no-transactions-message')).toBeInTheDocument();
    });
  });

  test('does not show Load More button when all transactions are visible', async () => {
    renderWithClient(<TransactionList 
      transactionHashes={mockTransactionHashes.slice(0, 3)} 
    />);
    
    // Wait for the transactions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument();
    });
    
    // Should show the count
    await waitFor(() => {
      expect(screen.getByText('Showing 3 of 3 transactions')).toBeInTheDocument();
    });
    
    // Should not have a Load More button
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });
});