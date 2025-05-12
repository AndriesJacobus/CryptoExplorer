import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { formatTimestamp, formatNumber, truncateMiddle, identifyMiner, formatBtcAmount } from '../utils/formatters';
import { createSequencedAnimation } from '../styles/animations';

/**
 * BlockCard component for displaying a blockchain block in a list item format
 * Wrapped with React.memo for performance optimization to prevent unnecessary re-renders
 */
const BlockCard = ({ block, isNew, animationIndex = 0 }) => {
  if (!block) return null;
  
  return (
    <BlockCardContainer isNew={isNew} animationIndex={animationIndex}>
      <BlockHeader>
        <BlockHeight>Block #{block.height}</BlockHeight>
        <BlockTime>{formatTimestamp(block.time)}</BlockTime>
      </BlockHeader>
      
      <BlockContent>
        <BlockDetail>
          <DetailLabel>Hash:</DetailLabel>
          <DetailValue monospace>
            <Link to={`/btc/block/${block.hash}`}>{truncateMiddle(block.hash, 8, 8)}</Link>
          </DetailValue>
        </BlockDetail>
        
        <BlockDetail>
          <DetailLabel>Miner:</DetailLabel>
          <DetailValue>{block.miner || identifyMiner(block.coinbase || '')}</DetailValue>
        </BlockDetail>
        
        <BlockDetail>
          <DetailLabel>Transactions:</DetailLabel>
          <DetailValue>{formatNumber(block.tx.length || 0)}</DetailValue>
        </BlockDetail>
        
        <BlockDetail>
          <DetailLabel>Size:</DetailLabel>
          <DetailValue>{formatNumber(block.size || 0)} bytes</DetailValue>
        </BlockDetail>

        <BlockDetail>
          <DetailLabel>Confirmations:</DetailLabel>
          <DetailValue>{formatNumber(block.confirmations || 0)}</DetailValue>
        </BlockDetail>

        <BlockDetail>
          <DetailLabel>Difficulty:</DetailLabel>
          <DetailValue>{formatNumber(block.difficulty || 0)}</DetailValue>
        </BlockDetail>

        <BlockDetail>
          <DetailLabel>Transaction Volume:</DetailLabel>
          <DetailValue>{block.transactionVolume ? formatBtcAmount(block.transactionVolume) : 'Unknown'}</DetailValue>
        </BlockDetail>
      </BlockContent>
      
      <BlockFooter>
        <ViewDetailsLink to={`/btc/block/${block.hash}`}>View Details</ViewDetailsLink>
      </BlockFooter>
    </BlockCardContainer>
  );
};

// Styled components
const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const BlockCardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  ${({ isNew, animationIndex, theme }) => isNew && createSequencedAnimation(
    slideInFromLeft,
    0.5,
    animationIndex,
    0.3,
    theme.colors.primary + '15'
  )}
  
  ${({ isNew, theme }) => isNew && `
    border-left: 4px solid ${theme.colors.primary};
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
`;

const BlockHeight = styled.h3`
  font-weight: 600;
  margin: 0;
`;

const BlockTime = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const BlockContent = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
`;

const BlockDetail = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  flex: 0 0 110px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
`;

const DetailValue = styled.span`
  flex: 1;
  word-break: ${props => props.monospace ? 'break-all' : 'normal'};
  font-family: ${props => props.monospace ? 'monospace' : 'inherit'};
`;

const BlockFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  text-align: right;
`;

const ViewDetailsLink = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.small} ${theme.spacing.medium}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 600;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    text-decoration: none;
  }
`;

// Export memoized component to prevent unnecessary re-renders
export default memo(BlockCard);