import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import blockchainService from '../services/api/blockchainService';
import cryptoService from '../services/api/cryptoService';
import BlockTable from '../components/BlockTable';
import BlockCard from '../components/BlockCard';
import CryptoPriceCard from '../components/CryptoPriceCard';
import ErrorMessage from '../components/ErrorMessage';

const HomePage = () => {
  // State to store all loaded blocks
  const [blocks, setBlocks] = useState([]);
  // State to track if we're loading more blocks
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // State to track if we're checking for new blocks
  const [isCheckingNew, setIsCheckingNew] = useState(false);
  // State to track the lowest block height we've loaded
  const [lowestBlockHeight, setLowestBlockHeight] = useState(null);
  // State to track the highest block height we've loaded
  const [highestBlockHeight, setHighestBlockHeight] = useState(null);
  // Initial number of blocks to load
  const initialBlockCount = 10;
  // Number of additional blocks to load when clicking "Load More"
  const additionalBlockCount = 10;
  // New state to track screen width for responsive layout
  const [isMobile, setIsMobile] = useState(false);
  // Reference to keep track of previously loaded blocks for animation
  const prevBlocksRef = useRef([]);
  // State to track newly added blocks that should be animated
  const [newBlockHashes, setNewBlockHashes] = useState({});
  
  // Effect to handle window resize and determine if mobile view should be shown
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Fetch initial latest blocks with React Query
  const { 
    data: latestBlocks,
    isLoading: initialLoading, 
    error: blocksError,
    refetch: refetchBlocks 
  } = useQuery({
    queryKey: ['latestBlocks', initialBlockCount],
    queryFn: () => blockchainService.getLatestBlocks(initialBlockCount),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
    onSuccess: (data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setBlocks(data);
        const sortedBlocks = [...data].sort((a, b) => b.height - a.height);
        setLowestBlockHeight(sortedBlocks[sortedBlocks.length - 1].height);
        setHighestBlockHeight(sortedBlocks[0].height);
      }
    }
  });

  // Use effect to set blocks when latestBlocks data is available
  useEffect(() => {
    if (latestBlocks && Array.isArray(latestBlocks) && latestBlocks.length > 0) {
      setBlocks(latestBlocks);
      const sortedBlocks = [...latestBlocks].sort((a, b) => b.height - a.height);
      setLowestBlockHeight(sortedBlocks[sortedBlocks.length - 1].height);
      setHighestBlockHeight(sortedBlocks[0].height);
    }
  }, [latestBlocks]);

  // Fetch cryptocurrency prices
  const {
    data: cryptoPrices,
    isLoading: cryptoLoading,
    error: cryptoError
  } = useQuery({
    queryKey: ['cryptoPrices'],
    queryFn: () => cryptoService.getCryptoPrices(),
    staleTime: 300000, // 5 minutes cache
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Handle loading more blocks, including checking for newer blocks
  const handleLoadMore = async () => {
    if (isLoadingMore || !lowestBlockHeight || !highestBlockHeight) return;
    
    try {
      setIsLoadingMore(true);
      
      // First, check for newer blocks
      setIsCheckingNew(true);
      const newerBlocks = await blockchainService.getNewerBlocks(highestBlockHeight, additionalBlockCount);
      setIsCheckingNew(false);
      
      // Then get older blocks
      const olderBlocks = await blockchainService.getAdditionalBlocks(lowestBlockHeight, additionalBlockCount);
      
      // Update state with both new and old blocks
      if ((newerBlocks && newerBlocks.length > 0) || (olderBlocks && olderBlocks.length > 0)) {
        setBlocks(prevBlocks => {
          // Combine all blocks: newer + current + older
          const combinedBlocks = [...(newerBlocks || []), ...prevBlocks, ...(olderBlocks || [])];
          
          // Remove any duplicates based on block hash
          const uniqueBlocks = Array.from(
            new Map(combinedBlocks.map(block => [block.hash, block])).values()
          );
          
          // Sort blocks by height in descending order (latest blocks first)
          return uniqueBlocks.sort((a, b) => b.height - a.height);
        });
        
        // Update the lowest block height if we got older blocks
        if (olderBlocks && olderBlocks.length > 0) {
          const lowestNewBlock = [...olderBlocks].sort((a, b) => a.height - b.height)[0];
          setLowestBlockHeight(lowestNewBlock.height);
        }
        
        // Update the highest block height if we got newer blocks
        if (newerBlocks && newerBlocks.length > 0) {
          const highestNewBlock = [...newerBlocks].sort((a, b) => b.height - a.height)[0];
          setHighestBlockHeight(highestNewBlock.height);
        }
      }
    } catch (error) {
      console.error("Error during block update:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRetry = () => {
    refetchBlocks();
  };

  // Render blocks as cards for mobile view
  const renderBlockCards = () => {
    if (!blocks || blocks.length === 0) {
      return <EmptyMessage>No blocks found</EmptyMessage>;
    }
    
    return (
      <BlockCardsContainer>
        {blocks.map((block) => (
          <BlockCard 
            key={block.hash} 
            block={block} 
            isNew={newBlockHashes[block.hash] !== undefined}
            animationIndex={newBlockHashes[block.hash]}
          />
        ))}
      </BlockCardsContainer>
    );
  };

  // Effect to detect new blocks and mark them for animation
  useEffect(() => {
    if (!blocks || blocks.length === 0 || prevBlocksRef.current.length === 0) {
      // Initialize the ref on first load
      prevBlocksRef.current = [...blocks];
      return;
    }
    
    // Find blocks that weren't in the previous state
    const prevBlocksHashes = new Set(prevBlocksRef.current.map(block => block.hash));
    const newBlocks = blocks.filter(block => !prevBlocksHashes.has(block.hash));
    
    if (newBlocks.length > 0) {
      // Sort new blocks by height (descending) to ensure proper animation sequence
      const sortedNewBlocks = [...newBlocks].sort((a, b) => b.height - a.height);
      
      // Create object with new block hashes mapped to their animation index
      const newBlocksObject = {};
      sortedNewBlocks.forEach((block, index) => {
        newBlocksObject[block.hash] = index;
      });
      
      // Update the state with new blocks
      setNewBlockHashes(newBlocksObject);
      
      // Clear the animation flags after animation completes
      // Base time (0.3s per block) + small buffer
      const animationDuration = sortedNewBlocks.length * 0.3 + 0.5;
      const timer = setTimeout(() => {
        setNewBlockHashes({});
      }, animationDuration * 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Update the ref with current blocks for next comparison
    prevBlocksRef.current = [...blocks];
  }, [blocks]);

  return (
    <HomeContainer>
      <HeaderSection>
        <h1>Bitcoin Blockchain Explorer</h1>
        <p>Explore the latest blocks on the Bitcoin blockchain</p>
      </HeaderSection>
      
      <ContentGrid>
        {/* Sidebar - Cryptocurrency Information */}
        <SidebarSection>
          <SectionHeader>
            <h2>Cryptocurrency Prices</h2>
          </SectionHeader>
          
          {cryptoLoading && <LoadingMessage>Loading cryptocurrency data...</LoadingMessage>}
          
          {cryptoError && (
            <ErrorMessage
              error={cryptoError}
              message="Failed to load cryptocurrency prices"
            />
          )}
          
          {!cryptoLoading && !cryptoError && cryptoPrices?.length > 0 && (
            <CryptoCardsList>
              {cryptoPrices.map(crypto => (
                <CryptoPriceCard key={crypto.id} crypto={crypto} />
              ))}
            </CryptoCardsList>
          )}
        </SidebarSection>
        
        {/* Main Content - Latest Blocks Section */}
        <MainContentSection>
          <SectionHeader>
            <h2>Latest Blocks</h2>
          </SectionHeader>
          
          {initialLoading && <LoadingMessage>Loading latest blocks...</LoadingMessage>}
          
          {blocksError && (
            <ErrorMessage
              error={blocksError}
              message="Failed to load blockchain data"
              onRetry={handleRetry}
            />
          )}
          
          {!initialLoading && !blocksError && blocks?.length > 0 && (
            <>
              {/* Conditionally render based on screen size */}
              {isMobile ? renderBlockCards() : <BlockTable blocks={blocks} isLoading={false} />}
              
              <LoadMoreButtonContainer>
                <LoadMoreButton 
                  onClick={handleLoadMore} 
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    isCheckingNew ? 'Checking for new blocks...' : 'Loading...'
                  ) : 'Load More Blocks'}
                </LoadMoreButton>
                {isLoadingMore && <LoadingSpinner />}
              </LoadMoreButtonContainer>
            </>
          )}
          
          {!initialLoading && !blocksError && (!blocks || blocks.length === 0) && (
            <EmptyMessage>No blocks found</EmptyMessage>
          )}
        </MainContentSection>
      </ContentGrid>
    </HomeContainer>
  );
};

// Styled components
const HomeContainer = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  box-sizing: border-box;
`;

const HeaderSection = styled.section`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: ${({ theme }) => theme.fontSizes.xxlarge};
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
    
    @media (max-width: 768px) {
      font-size: ${({ theme }) => theme.fontSizes.xlarge};
    }
  }
  
  p {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContentSection = styled.section`
  margin-bottom: 2rem;
`;

const SidebarSection = styled.aside`
  @media (max-width: 1024px) {
    order: -1; /* Show sidebar before main content on mobile */
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  
  h2 {
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.xlarge};
    
    @media (max-width: 768px) {
      font-size: ${({ theme }) => theme.fontSizes.large};
    }
  }
`;

const CryptoCardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BlockCardsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const LoadingMessage = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.textLight};
`;

const LoadMoreButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
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

const LoadingSpinner = styled.div`
  margin-left: 1rem;
  border: 3px solid rgba(0, 0, 0, 0.1);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-left-color: ${({ theme }) => theme.colors.primary};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default HomePage;