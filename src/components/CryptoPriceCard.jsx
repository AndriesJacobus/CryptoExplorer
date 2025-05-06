import React from 'react';
import styled from 'styled-components';
import { formatNumber } from '../utils/formatters';

/**
 * Component for displaying cryptocurrency price and market information
 */
const CryptoPriceCard = ({ crypto }) => {
  const { name, symbol, price, change24h, marketCap, logo } = crypto;
  
  // Determine if price change is positive or negative
  const isPriceUp = change24h >= 0;
  
  return (
    <CardContainer>
      <CardHeader>
        {logo && <CryptoLogo src={logo} alt={`${name} logo`} />}
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
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const CryptoLogo = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 0.75rem;
`;

const CryptoName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: 600;
  margin: 0;
  margin-right: 0.5rem;
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
`;

const CurrentPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 700;
  margin-right: 0.75rem;
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
`;

const MarketCapLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
`;

const MarketCapValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 600;
`;

export default CryptoPriceCard;