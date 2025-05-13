import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled, { keyframes } from 'styled-components';
import { useMemo, useCallback } from 'react';
import blockchainService from '../services/api/blockchainService';
import ErrorMessage from '../components/ErrorMessage';
import BlockIcon from '../components/BlockIcon';
import TransactionList from '../components/TransactionList';
import { 
  formatTimestamp, 
  formatNumber, 
  formatBtcAmount, 
  identifyMiner,
  truncateMiddle
} from '../utils/formatters';

const BlockDetailPage = () => {
  const { blockHash } = useParams();
  
  // Fetch block details by hash using React Query
  const { 
    data: block, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['block', blockHash],
    queryFn: () => blockchainService.getBlockByHash(blockHash),
    enabled: !!blockHash,
    retry: 1,
    staleTime: 600000, // 10 minutes cache
  });

  // Memoized callback for handling retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Enhanced memoization for derived values with more detailed dependencies
  const derivedData = useMemo(() => {
    if (!block) return null;
    
    // Calculate different values from block data
    const totalFees = block.fee_total || 0;
    const transactionCount = block.tx?.length || 0;
    const averageFee = transactionCount > 0 ? totalFees / transactionCount : 0;
    const minerName = block.miner || identifyMiner(block.coinbase || '');
    const sizeInKb = block.size ? (block.size / 1024).toFixed(2) : '0';
    const blockReward = block.reward || 625000000; // Current block reward (6.25 BTC)
    
    // Format timestamp with memoization
    const formattedTimestamp = formatTimestamp(block.time);
    
    // Calculate confirmation count (usually from the API, but as a fallback)
    const confirmations = block.confirmations || 0;
    
    // Get transaction volume from the correct property
    const transactionVolume = block.transactionVolume || 0;
    
    return {
      totalFees,
      transactionCount,
      averageFee,
      minerName,
      sizeInKb,
      blockReward,
      formattedTimestamp,
      confirmations,
      transactionVolume
    };
  }, [block]);

  if (isLoading) {
    return (
      <BlockDetailContainer>
        {/* Skeleton Header */}
        <SkeletonHeaderBanner>
          <SkeletonHeaderContent>
            <SkeletonIconCircle />
            <div style={{ flex: 1 }}>
              <SkeletonTextBlock height="40px" width="60%" marginBottom="12px" />
              <SkeletonTextBlock height="20px" width="80%" />
            </div>
          </SkeletonHeaderContent>
        </SkeletonHeaderBanner>
        
        <ContentSection>
          {/* Skeleton Hash Section */}
          <SkeletonHashSection>
            <SkeletonTextBlock height="16px" width="120px" marginBottom="12px" />
            <SkeletonTextBlock height="24px" />
          </SkeletonHashSection>
          
          {/* Skeleton Block Details */}
          <SkeletonTextBlock height="32px" width="180px" marginBottom="16px" />
          <BlockDetailsGrid>
            {Array(15).fill(0).map((_, index) => (
              <SkeletonDetailItem key={index}>
                <SkeletonTextBlock height="16px" width="40%" marginBottom="12px" />
                <SkeletonTextBlock height="24px" width="70%" />
              </SkeletonDetailItem>
            ))}
          </BlockDetailsGrid>
          
          {/* Skeleton Navigation */}
          <SkeletonNavigation>
            <SkeletonNavButton />
            <SkeletonNavButton style={{ maxWidth: '120px' }} />
            <SkeletonNavButton />
          </SkeletonNavigation>
          
          {/* Skeleton Transactions */}
          <SkeletonTextBlock height="32px" width="220px" marginBottom="16px" />
          <div>
            {Array(5).fill(0).map((_, index) => (
              <SkeletonTransactionItem key={index} />
            ))}
          </div>
        </ContentSection>
      </BlockDetailContainer>
    );
  }

  // Display error message with retry option
  if (error) {
    return (
      <ErrorContainer>
        <ErrorMessage 
          error={error}
          message={`Error loading block details for hash: ${blockHash}`}
          onRetry={handleRetry}
        />
        <ErrorActionButton onClick={() => window.history.back()}>
          Back
        </ErrorActionButton>
      </ErrorContainer>
    );
  }

  if (!block) return <NotFoundMessage>Block not found</NotFoundMessage>;

  return (
    <BlockDetailContainer>
      {/* Enhanced block header with Bitcoin icon */}
      <BlockHeaderBanner>
        <BlockHeaderContent>
          <IconSection>
            <BlockIcon size={64} />
          </IconSection>
          <BlockInfo>
            <BlockTitle>Bitcoin Block #{formatNumber(block.height)}</BlockTitle>
            <BlockTime>
              Mined on {derivedData?.formattedTimestamp} • {derivedData?.transactionCount} transactions
            </BlockTime>
          </BlockInfo>
        </BlockHeaderContent>
      </BlockHeaderBanner>
      
      <ContentSection>
        {/* Block Hash Section */}
        <BlockHashSection>
          <HashLabel>Block Hash</HashLabel>
          <HashValue>{block.hash}</HashValue>
        </BlockHashSection>
        
        {/* Block Details Grid */}
        <SectionTitle>Block Details</SectionTitle>
        <BlockDetailsGrid>
          <DetailItem>
            <DetailLabel>Height</DetailLabel>
            <DetailValue>{formatNumber(block.height)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Confirmations</DetailLabel>
            <DetailValue>{formatNumber(derivedData?.confirmations)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Timestamp</DetailLabel>
            <DetailValue>{derivedData?.formattedTimestamp}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Miner</DetailLabel>
            <DetailValue>{derivedData?.minerName}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Number of Transactions</DetailLabel>
            <DetailValue>{formatNumber(derivedData?.transactionCount)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Difficulty</DetailLabel>
            <DetailValue>{formatNumber(block.difficulty)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Merkle Root</DetailLabel>
            <DetailValue monospace title={block.merkle}>
              {truncateMiddle(block.merkle, 15, 15)}
            </DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Version</DetailLabel>
            <DetailValue>{block.version}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Bits</DetailLabel>
            <DetailValue>{block.bits}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Weight</DetailLabel>
            <DetailValue>{formatNumber(block.weight || 0)} WU</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Size</DetailLabel>
            <DetailValue>{derivedData?.sizeInKb} KB</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Nonce</DetailLabel>
            <DetailValue>{formatNumber(block.nonce)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Transaction Volume</DetailLabel>
            <DetailValue>
              {derivedData?.transactionVolume ? 
                formatBtcAmount(derivedData.transactionVolume) : 
                (block.total ? formatBtcAmount(block.total) : 'No transactions')}
            </DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Block Reward</DetailLabel>
            <DetailValue>{formatBtcAmount(derivedData?.blockReward)}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Fee Reward</DetailLabel>
            <DetailValue>{formatBtcAmount(derivedData?.totalFees)}</DetailValue>
          </DetailItem>
        </BlockDetailsGrid>
        
        {/* Block Navigation */}
        <BlockNavigation>
          {block.previousblockhash && (
            <NavButton to={`/btc/block/${block.previousblockhash}`}>
              ← Previous Block
            </NavButton>
          )}
          <NavButtonCenter to="/">
            Home
          </NavButtonCenter>
          {block.nextblockhash && (
            <NavButton to={`/btc/block/${block.nextblockhash}`} isNext>
              Next Block →
            </NavButton>
          )}
        </BlockNavigation>
        
        {/* Transactions section with our new components */}
        <TransactionsSection>
          <SectionTitle>Transactions ({derivedData?.transactionCount})</SectionTitle>
          
          {/* Use our new TransactionList component */}
          <TransactionList 
            blockHash={block.hash} 
            transactionHashes={block.tx} 
            initialCount={10}
          />
        </TransactionsSection>
      </ContentSection>
    </BlockDetailContainer>
  );
};

// Styled components
const BlockDetailContainer = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const BlockHeaderBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 2rem 0;
  margin-bottom: 2rem;
  width: 100%;
`;

const BlockHeaderContent = styled.div`
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const IconSection = styled.div`
  margin-right: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const BlockInfo = styled.div`
  flex: 1;
`;

const BlockTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  font-weight: 700;
  margin: 0 0 0.5rem 0;
`;

const BlockTime = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  margin: 0;
  opacity: 0.9;
`;

const ContentSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
`;

const BlockHashSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const HashLabel = styled.div`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.5rem;
`;

const HashValue = styled.div`
  font-family: monospace;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  word-break: break-all;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-weight: 600;
  margin: 2rem 0 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const BlockDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const DetailLabel = styled.div`
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const DetailValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  word-break: break-word;
  font-family: ${props => props.monospace ? 'monospace' : 'inherit'};
`;

const BlockNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const NavButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  flex: 1;
  margin: 0 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  &:first-child {
    margin-left: 0;
  }
  
  &:last-child {
    margin-right: 0;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
  
  @media (max-width: 768px) {
    margin: 0;
  }
`;

const NavButtonCenter = styled(NavButton)`
  max-width: 120px;
  margin: 0 1rem;
  
  @media (max-width: 768px) {
    margin: 0;
    max-width: 100%;
  }
`;

const TransactionsSection = styled.section`
  margin-top: 3rem;
`;

const ComingSoonMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: 1.5rem;
  margin: 1rem 0;
  
  p {
    margin: 0.5rem 0;
    
    &:first-child {
      font-weight: 600;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
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
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
`;

const ErrorActionButton = styled.button`
  display: block;
  margin: 1rem auto 0;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }
`;

const NotFoundMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin: 2rem auto;
  max-width: 800px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

// Skeleton loading animation
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

// Skeleton components for loading states
const SkeletonBase = styled.div`
  background: ${({ theme }) => theme.colors.backgroundLight};
  background-image: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundLight} 0px,
    ${({ theme }) => theme.colors.background} 40px,
    ${({ theme }) => theme.colors.backgroundLight} 80px
  );
  background-size: 600px 100%;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  animation: ${shimmer} 1.5s infinite linear;
`;

const SkeletonHeaderBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.primary + '80'}; // 50% opacity
  padding: 2rem 0;
  margin-bottom: 2rem;
  width: 100%;
`;

const SkeletonHeaderContent = styled.div`
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SkeletonIconCircle = styled(SkeletonBase)`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const SkeletonTextBlock = styled(SkeletonBase)`
  height: ${({ height }) => height || '24px'};
  width: ${({ width }) => width || '100%'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '8px'};
  border-radius: 4px;
`;

const SkeletonHashSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const SkeletonDetailItem = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const SkeletonNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const SkeletonNavButton = styled(SkeletonBase)`
  height: 45px;
  flex: 1;
  margin: 0 0.5rem;
  
  &:first-child {
    margin-left: 0;
  }
  
  &:last-child {
    margin-right: 0;
  }
  
  @media (max-width: 768px) {
    margin: 0;
  }
`;

const SkeletonTransactionItem = styled(SkeletonBase)`
  height: 80px;
  margin-bottom: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

export default BlockDetailPage;