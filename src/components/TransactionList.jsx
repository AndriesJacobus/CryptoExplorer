import React, { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import TransactionItem from './TransactionItem';
import blockchainService from '../services/api/blockchainService';
import ErrorMessage from './ErrorMessage';
import { calculateAnimationDuration } from '../styles/animations';

/**
 * Component to display a list of transactions with pagination
 * Optimized with memo and batch loading for performance
 */
const TransactionList = memo(({ blockHash, transactionHashes, initialCount = 10 }) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [animatedTransactions, setAnimatedTransactions] = useState({});
  const prevTransactionsRef = useRef([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const initialLoadCompletedRef = useRef(false);
  
  // Memoize sliced transaction hashes to prevent unnecessary re-renders
  const displayedHashes = useMemo(() => 
    transactionHashes?.slice(0, visibleCount) || [],
    [transactionHashes, visibleCount]
  );

  // Fetch transactions data for the visible hashes
  const { 
    data: newTransactionsData, 
    isLoading, 
    error, 
    refetch
  } = useQuery({
    queryKey: ['transactions', blockHash, visibleCount],
    queryFn: async () => {
      console.log("Fetching transactions with displayedHashes:", displayedHashes);
      const result = await blockchainService.getTransactionsByIds(displayedHashes);
      console.log("API returned transactions:", result);
      return result;
    },
    enabled: displayedHashes.length > 0,
    retry: 1,
    staleTime: 300000, // 5 minutes cache
    onSuccess: (data) => {
      console.log("onSuccess fired with data:", data);
      console.log("Current allTransactions:", allTransactions);
      
      // Store all transaction IDs we've seen so far
      if (data && Array.isArray(data)) {
        // Get only the new transactions that aren't in our current state
        const existingTxIds = new Set(allTransactions.map(tx => tx.txid || tx.hash));
        const newTxs = data.filter(tx => !existingTxIds.has(tx.txid || tx.hash));
        
        console.log("Filtered new transactions:", newTxs);
        
        if (newTxs.length > 0) {
          console.log(`Adding ${newTxs.length} new transactions`);
          
          // Add new transactions to the collection
          setAllTransactions(prev => {
            const updated = [...prev, ...newTxs];
            console.log("Updated allTransactions:", updated);
            return updated;
          });
          
          // Set up animations for new transactions
          const newAnimatedTxs = {};
          newTxs.forEach((tx, index) => {
            newAnimatedTxs[tx.txid || tx.hash] = index;
          });
          
          setAnimatedTransactions(newAnimatedTxs);
          
          // Clear animation flags after sufficient time
          const animationDuration = calculateAnimationDuration(newTxs.length);
          const timer = setTimeout(() => {
            setAnimatedTransactions({});
          }, animationDuration);
          
          return () => clearTimeout(timer);
        } else {
          console.log("No new transactions found");
          // Even if no new transactions, update reference for next comparison
          prevTransactionsRef.current = [...data];
        }
        
        // Always reset loading state
        console.log("Resetting loading state");
        setLoadingMore(false);
      }
    },
    onError: (err) => {
      console.error("Error fetching transactions:", err);
      setLoadingMore(false);
    },
  });

  // Initial load handling
  useEffect(() => {
    if (newTransactionsData && Array.isArray(newTransactionsData) && newTransactionsData.length > 0) {
      if (allTransactions.length === 0 && !initialLoadCompletedRef.current) {
        // Only set transactions on first load
        console.log("Initial load: Setting transactions", newTransactionsData.length);
        setAllTransactions(newTransactionsData);
        prevTransactionsRef.current = [...newTransactionsData];
        
        // Apply animation to initial transactions with sequential indices
        const initialAnimatedTxs = {};
        newTransactionsData.forEach((tx, index) => {
          initialAnimatedTxs[tx.txid || tx.hash] = index;
        });
        
        setAnimatedTransactions(initialAnimatedTxs);
        
        // Clear animation flags after they complete
        const animationDuration = calculateAnimationDuration(newTransactionsData.length);
        setTimeout(() => {
          setAnimatedTransactions({});
        }, animationDuration);
        
        initialLoadCompletedRef.current = true;
      }
    }
  }, [newTransactionsData, allTransactions.length]);

  // Update transactions when new data arrives - only for "load more" operations
  useEffect(() => {
    // Skip for initial load, we handle that separately
    if (!initialLoadCompletedRef.current || !loadingMore || !newTransactionsData || !Array.isArray(newTransactionsData)) return;
    
    console.log("Processing new batch of transactions:", newTransactionsData.length);
    
    // Function to identify a transaction (using hash or txid)
    const getTransactionId = tx => tx.txid || tx.hash;
    
    // Create a map of existing transactions for quick lookup
    const existingTxMap = new Map();
    allTransactions.forEach(tx => {
      existingTxMap.set(getTransactionId(tx), true);
    });
    
    // Filter to find only new transactions
    const newTxs = newTransactionsData.filter(tx => !existingTxMap.has(getTransactionId(tx)));
    
    if (newTxs.length > 0) {
      console.log(`Found ${newTxs.length} new transactions to add`);
      
      // Update all transactions
      setAllTransactions(current => {
        const updated = [...current, ...newTxs];
        console.log("Updated transaction count:", updated.length);
        return updated;
      });
      
      // Set animations for new transactions
      const animatedTxs = {};
      newTxs.forEach((tx, index) => {
        animatedTxs[getTransactionId(tx)] = index;
      });
      setAnimatedTransactions(animatedTxs);
      
      // Clear animations after they complete
      const animationDuration = calculateAnimationDuration(newTxs.length);
      setTimeout(() => {
        setAnimatedTransactions({});
      }, animationDuration);
    } else {
      console.log("No new transactions found in this batch");
    }
    
    // Always reset loading state
    setLoadingMore(false);
  }, [newTransactionsData, allTransactions, loadingMore]);

  // Memoized callback to prevent unnecessary re-renders
  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    
    // First set the new visible count to trigger the query
    setVisibleCount(prev => {
      console.log(`Increasing visibleCount from ${prev} to ${prev + 10}`);
      return prev + 10;
    });
  }, [loadingMore]);

  // Memoized calculation for optimized render performance
  const { hasMore, transactionCount } = useMemo(() => ({
    hasMore: transactionHashes && visibleCount < transactionHashes.length,
    transactionCount: transactionHashes?.length || 0
  }), [transactionHashes, visibleCount]);

  // If there are no transactions to display, don't render anything
  if (transactionCount === 0 && !isLoading && !error) {
    return null;
  }

  // Initial loading state
  if (isLoading && allTransactions.length === 0) {
    return (
      <Container>
        <LoadingMessage>
          <LoadingSpinner />
          <LoadingText>Loading transactions...</LoadingText>
        </LoadingMessage>
      </Container>
    );
  }

  if (error && allTransactions.length === 0) {
    return (
      <Container>
        <ErrorMessage
          error={error}
          message="Failed to load transaction data"
          onRetry={refetch}
        />
      </Container>
    );
  }

  return (
    <Container>
      {allTransactions.length === 0 && !isLoading && (
        <EmptyMessage data-testid="no-transactions-message">No transactions found for this block.</EmptyMessage>
      )}

      {allTransactions.length > 0 && (
        <>
          <TransactionHeader>
            <TransactionCount>
              Showing {allTransactions.length} of {transactionCount} transactions
              {loadingMore && (
                <LoadingMoreIndicator>
                  <SmallLoadingSpinner />
                  <span>Loading more...</span>
                </LoadingMoreIndicator>
              )}
            </TransactionCount>
          </TransactionHeader>

          <TransactionsContainer>
            {allTransactions.map(transaction => (
              <TransactionItem
                key={transaction.txid || transaction.hash}
                transaction={transaction}
                isNew={animatedTransactions[transaction.txid || transaction.hash] !== undefined}
                animationIndex={animatedTransactions[transaction.txid || transaction.hash]}
              />
            ))}
          </TransactionsContainer>

          {hasMore && (
            <LoadMoreButtonContainer>
              <LoadMoreButton 
                onClick={handleLoadMore} 
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Transactions'}
              </LoadMoreButton>
            </LoadMoreButtonContainer>
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

const LoadMoreButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
`;

const LoadMoreButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, disabled }) => 
    disabled ? theme.colors.textLight : theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
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

const LoadingMoreIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
`;

const SmallLoadingSpinner = styled.div`
  border: 2px solid rgba(0, 0, 0, 0.1);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-left-color: ${({ theme }) => theme.colors.primary};
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default TransactionList;