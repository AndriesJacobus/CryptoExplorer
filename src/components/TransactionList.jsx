import React, { useState, useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import TransactionItem from './TransactionItem';
import blockchainService from '../services/api/blockchainService';
import ErrorMessage from './ErrorMessage';

/**
 * Component to display a list of transactions with pagination
 * Optimized with memo and batch loading for performance
 */
const TransactionList = memo(({ blockHash, transactionHashes, initialCount = 10 }) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  
  // Memoize sliced transaction hashes to prevent unnecessary re-renders
  const displayedHashes = useMemo(() => 
    transactionHashes?.slice(0, visibleCount) || [],
    [transactionHashes, visibleCount]
  );

  // Fetch transactions data for the visible hashes
  const { 
    data: transactions, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['transactions', blockHash, visibleCount],
    queryFn: () => blockchainService.getTransactionsByIds(displayedHashes),
    enabled: displayedHashes.length > 0,
    retry: 1,
    staleTime: 300000, // 5 minutes cache
  });

  // Memoized callback to prevent unnecessary re-renders
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + 10);
  }, []);

  // Memoized calculation for optimized render performance
  const { hasMore, transactionCount } = useMemo(() => ({
    hasMore: transactionHashes && visibleCount < transactionHashes.length,
    transactionCount: transactionHashes?.length || 0
  }), [transactionHashes, visibleCount]);

  // If there are no transactions to display, don't render anything
  if (transactionCount === 0 && !isLoading && !error) {
    return null;
  }

  return (
    <Container>
      {isLoading && (
        <LoadingMessage>
          <LoadingSpinner />
          <LoadingText>Loading transactions...</LoadingText>
        </LoadingMessage>
      )}

      {error && (
        <ErrorMessage
          error={error}
          message="Failed to load transaction data"
          onRetry={refetch}
        />
      )}

      {!isLoading && !error && transactions?.length === 0 && (
        <EmptyMessage>No transactions found for this block.</EmptyMessage>
      )}

      {!isLoading && !error && transactions?.length > 0 && (
        <>
          <TransactionHeader>
            <TransactionCount>
              Showing {transactions.length} of {transactionCount} transactions
            </TransactionCount>
          </TransactionHeader>

          <TransactionsContainer>
            {/* Render only visible transactions for better performance */}
            {transactions.map(transaction => (
              <TransactionItem
                key={transaction.txid}
                transaction={transaction}
              />
            ))}
          </TransactionsContainer>

          {hasMore && (
            <LoadMoreButton onClick={handleLoadMore}>
              Load More Transactions
            </LoadMoreButton>
          )}
        </>
      )}
    </Container>
  );
});

// Add a display name for better debugging
TransactionList.displayName = 'TransactionList';

// Styled components
const Container = styled.div`
  margin-top: 1rem;
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TransactionCount = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const TransactionsContainer = styled.div`
  margin-bottom: 1rem;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 1.5rem auto;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border-left-color: ${({ theme }) => theme.colors.primary};
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

export default TransactionList;