import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import blockchainService from '../services/api/blockchainService';
import cryptoService from '../services/api/cryptoService';
import BlockCard from '../components/BlockCard';
import CryptoPriceCard from '../components/CryptoPriceCard';
import ErrorMessage from '../components/ErrorMessage';

const HomePage = () => {
  const [blocksToShow, setBlocksToShow] = useState(10);
  
  // Fetch latest blocks with React Query
  const { 
    data: latestBlocks, 
    isLoading: blocksLoading, 
    error: blocksError,
    refetch: refetchBlocks 
  } = useQuery({
    queryKey: ['latestBlocks', blocksToShow],
    queryFn: () => blockchainService.getLatestBlocks(blocksToShow),
    retry: 1, // Only retry once before showing error
  });

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
  });

  const handleLoadMore = () => {
    setBlocksToShow(prevCount => prevCount + 5);
  };

  const handleRetry = () => {
    refetchBlocks();
  };

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
          
          {blocksLoading && <LoadingMessage>Loading latest blocks...</LoadingMessage>}
          
          {blocksError && (
            <ErrorMessage
              error={blocksError}
              message="Failed to load blockchain data"
              onRetry={handleRetry}
            />
          )}
          
          {!blocksLoading && !blocksError && latestBlocks?.length > 0 && (
            <>
              <BlocksList>
                {latestBlocks.map((block) => (
                  <BlockCard key={block.hash} block={block} />
                ))}
              </BlocksList>
              
              <LoadMoreButton onClick={handleLoadMore}>
                Load More Blocks
              </LoadMoreButton>
            </>
          )}
          
          {!blocksLoading && !blocksError && (!latestBlocks || latestBlocks.length === 0) && (
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
  }
`;

const BlocksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CryptoCardsList = styled.div`
  display: flex;
  flex-direction: column;
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

const LoadMoreButton = styled.button`
  display: block;
  margin: 1.5rem auto 0;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }
`;

export default HomePage;