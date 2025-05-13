import React from 'react';
import styled from 'styled-components';
import { formatNumber } from '../utils/formatters';
import { slideInFromLeft, createSequencedAnimation } from '../styles/animations';

/**
 * Component for displaying cryptocurrency price and market information
 * Enhanced to be fully responsive on mobile screens
 */
const CryptoPriceCard = ({ crypto, isNew = false, animationIndex = 0 }) => {
  const { name, symbol, price, change24h, marketCap, logo } = crypto;
  
  // Determine if price change is positive or negative
  const isPriceUp = change24h >= 0;
  
  return (
    <CardContainer isNew={isNew} animationIndex={animationIndex}>
      <CardHeader>
        {logo && <CryptoLogo src={logo} alt={``} />}
        <CryptoName>{name}</CryptoName>
        <CryptoSymbol>{symbol}</CryptoSymbol>
      </CardHeader>
      
      <PriceSection>
        <CurrentPrice>${formatNumber(price)}</CurrentPrice>
        <PriceChange isUp={isPriceUp}>
          {isPriceUp ? '↑' : '↓'} {Math.abs(change24h).toFixed(2)}%
        </PriceChange>
      </PriceSection>
      
      <MarketCapSection>
        <MarketCapLabel>Market Cap</MarketCapLabel>
        <MarketCapValue>${formatNumber(marketCap)}</MarketCapValue>
      </MarketCapSection>
    </CardContainer>
  );
};

// Styled components
const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: 1.25rem;
  margin-bottom: 1rem;
  width: 100%; /* Ensure it takes full width of parent */
  max-width: 100%; /* Prevent overflow */
  box-sizing: border-box; /* Include padding in width calculation */
  overflow: hidden; /* Prevent content from causing overflow */
  
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
  
  @media (max-width: 480px) {
    padding: 1rem; /* Slightly reduce padding on very small screens */
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap; /* Allow wrapping on very small screens */
  
  @media (max-width: 350px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CryptoLogo = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 0.75rem;
  
  @media (max-width: 350px) {
    margin-bottom: 0.5rem;
  }
`;

const CryptoName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  margin: 0;
  margin-right: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.fontSizes.small};
  }
`;

const CryptoSymbol = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 400;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 1rem;
  flex-wrap: wrap; /* Allow wrapping on very small screens */
`;

const CurrentPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 700;
  margin-right: 0.75rem;
  word-break: break-word; /* Prevent overflow of long prices */
  
  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }
`;

const PriceChange = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
  color: ${({ theme, isUp }) => isUp ? theme.colors.success : theme.colors.error};
`;

const MarketCapSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; /* Allow wrapping on very small screens */
`;

const MarketCapLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
`;

const MarketCapValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
  word-break: break-word; /* Prevent overflow of long market cap values */
`;

export default CryptoPriceCard;