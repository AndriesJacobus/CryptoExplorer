import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { formatTimestamp, formatBtcAmount, truncateMiddle } from '../utils/formatters';

/**
 * Component to display a single transaction with expandable details
 */
const TransactionItem = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Memoize expensive calculations to prevent recalculation on re-renders
  const { totalOutput, fee } = useMemo(() => {
    // Calculate total input and output values
    const totalInput = transaction.inputs?.reduce((sum, input) => sum + (input.prev_out?.value || 0), 0) || 0;
    const totalOutput = transaction.outputs?.reduce((sum, output) => sum + (output.value || 0), 0) || 0;
    
    // Calculate fee (inputs - outputs)
    const fee = totalInput > 0 ? totalInput - totalOutput : transaction.fee || 0;
    
    return { totalOutput, fee };
  }, [transaction.inputs, transaction.outputs, transaction.fee]);

  return (
    <TransactionContainer>
      <TransactionSummary onClick={toggleExpand}>
        <TransactionIcon>
          {isExpanded ? '−' : '+'}
        </TransactionIcon>
        
        <TransactionData>
          <TransactionId title={transaction.txid}>
            {truncateMiddle(transaction.txid, 20, 20)}
          </TransactionId>
          
          <TransactionDetails>
            <TransactionTime>
              {transaction.time ? formatTimestamp(transaction.time) : 'Pending confirmation'}
            </TransactionTime>
            
            <TransactionAmount>
              Amount: {formatBtcAmount(totalOutput)}
            </TransactionAmount>
            
            <TransactionFee>
              Fee: {formatBtcAmount(fee)}
            </TransactionFee>
          </TransactionDetails>
        </TransactionData>
      </TransactionSummary>
      
      {isExpanded && (
        <TransactionExpanded>
          <DetailSection>
            <DetailTitle>Transaction Details</DetailTitle>
            
            <DetailRow>
              <DetailLabel>Transaction Hash:</DetailLabel>
              <DetailValue>{transaction.txid}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Received Time:</DetailLabel>
              <DetailValue>{transaction.time ? formatTimestamp(transaction.time) : 'Pending'}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <DetailValue>
                <StatusIndicator confirmed={transaction.confirmations > 0} />
                {transaction.confirmations > 0 ? 'Confirmed' : 'Unconfirmed'}
                {transaction.confirmations > 0 && ` (${transaction.confirmations} confirmations)`}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Size:</DetailLabel>
              <DetailValue>{transaction.size} bytes</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Weight:</DetailLabel>
              <DetailValue>{transaction.weight || 'N/A'} WU</DetailValue>
            </DetailRow>
          </DetailSection>
          
          {/* Inputs Section */}
          <InputsOutputsSection>
            <SectionTitle>Inputs ({transaction.inputs?.length || 0})</SectionTitle>
            <ScrollableList>
              {transaction.inputs?.map((input, index) => (
                <AddressItem key={index}>
                  <AddressHash title={input.prev_out?.addr || 'Coinbase Transaction'}>
                    {input.prev_out?.addr 
                      ? truncateMiddle(input.prev_out.addr, 15, 15) 
                      : 'Coinbase Transaction'}
                  </AddressHash>
                  {input.prev_out?.value && (
                    <AddressAmount>{formatBtcAmount(input.prev_out.value)}</AddressAmount>
                  )}
                </AddressItem>
              ))}
              {!transaction.inputs?.length && <EmptyMessage>No inputs data available</EmptyMessage>}
            </ScrollableList>
          </InputsOutputsSection>
          
          {/* Outputs Section */}
          <InputsOutputsSection>
            <SectionTitle>Outputs ({transaction.outputs?.length || 0})</SectionTitle>
            <ScrollableList>
              {transaction.outputs?.map((output, index) => (
                <AddressItem key={index}>
                  <AddressHash title={output.addr || 'Unknown Address'}>
                    {output.addr ? truncateMiddle(output.addr, 15, 15) : 'Unknown Address'}
                  </AddressHash>
                  {output.value && (
                    <AddressAmount>{formatBtcAmount(output.value)}</AddressAmount>
                  )}
                </AddressItem>
              ))}
              {!transaction.outputs?.length && <EmptyMessage>No outputs data available</EmptyMessage>}
            </ScrollableList>
          </InputsOutputsSection>
        </TransactionExpanded>
      )}
    </TransactionContainer>
  );
};

// Styled components
const TransactionContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: 1rem;
  overflow: hidden;
`;

const TransactionSummary = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const TransactionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const TransactionData = styled.div`
  flex: 1;
`;

const TransactionId = styled.div`
  font-family: monospace;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const TransactionDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
`;

const TransactionTime = styled.div`
  margin-right: 1.5rem;
`;

const TransactionAmount = styled.div`
  margin-right: 1.5rem;
`;

const TransactionFee = styled.div``;

const TransactionExpanded = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text};
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DetailLabel = styled.div`
  flex: 0 0 180px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  
  @media (max-width: 768px) {
    margin-bottom: 0.25rem;
  }
`;

const DetailValue = styled.div`
  flex: 1;
  word-break: break-all;
  display: flex;
  align-items: center;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ theme, confirmed }) => confirmed ? theme.colors.success : theme.colors.warning};
  margin-right: 0.5rem;
`;

const InputsOutputsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ScrollableList = styled.div`
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const AddressItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.small};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const AddressHash = styled.div`
  font-family: monospace;
`;

const AddressAmount = styled.div`
  font-weight: 600;
  margin-left: 1rem;
`;

const EmptyMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
`;

export default TransactionItem;