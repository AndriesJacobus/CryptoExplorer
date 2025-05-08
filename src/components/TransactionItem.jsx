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
  const { totalOutput, fee, primaryToAddress, primaryFromAddress } = useMemo(() => {
    // Calculate total input and output values
    let totalInput = 0;
    let totalOutput = 0;
    
    // Input value calculation - fully supporting blockchain.info raw tx format
    if (transaction.inputs && Array.isArray(transaction.inputs)) {
      totalInput = transaction.inputs.reduce((sum, input) => {
        // Raw API format
        return sum + (input.prev_out?.value || 0);
      }, 0);
    }

    // Output value calculation
    if (transaction.out && Array.isArray(transaction.out)) {
      // Raw API format
      totalOutput = transaction.out.reduce((sum, output) => {
        return sum + (output.value || 0);
      }, 0);
    } else if (transaction.outputs && Array.isArray(transaction.outputs)) {
      // Haskoin format (fallback)
      totalOutput = transaction.outputs.reduce((sum, output) => {
        return sum + (output.value || 0);
      }, 0);
    }
    
    // Calculate fee - for blockchain.info raw format, fee is included
    const fee = transaction.fee || (totalInput > 0 ? totalInput - totalOutput : 0);
    
    // Get primary recipient address (first output)
    let primaryToAddress = { addr: 'Unknown Address', value: 0 };
    
    // Handle different output formats with blockchain.info raw format as priority
    if (transaction.out && transaction.out.length > 0) {
      // Handle standard output with addr field directly
      if (transaction.out[0].addr) {
        primaryToAddress = {
          addr: transaction.out[0].addr,
          value: transaction.out[0].value || 0
        };
      } 
      // Handle P2SH/P2WSH/P2TR and other complex script types
      else if (transaction.out[0].script) {
        // For complex script types, extract any address if available or mark as 'Script Output'
        primaryToAddress = {
          addr: 'Script Output',
          value: transaction.out[0].value || 0
        };
      }
    } else if (transaction.outputs && transaction.outputs.length > 0) {
      // Fallback to haskoin format
      primaryToAddress = {
        addr: transaction.outputs[0].addr || 'Unknown Address',
        value: transaction.outputs[0].value || 0
      };
    }
    
    // Get primary sender address (first input)
    let primaryFromAddress = { addr: 'Unknown Address', value: 0 };
    
    // Check for coinbase transaction first
    const isCoinbase = transaction.is_coinbase || 
                      (transaction.inputs && transaction.inputs[0] && 
                       (transaction.inputs[0].coinbase || !transaction.inputs[0].prev_out));
    
    if (isCoinbase) {
      primaryFromAddress = {
        addr: 'Coinbase (Newly Generated Coins)',
        value: totalOutput
      };
    } 
    // Regular transaction with inputs 
    else if (transaction.inputs && transaction.inputs.length > 0) {
      if (transaction.inputs[0].prev_out && transaction.inputs[0].prev_out.addr) {
        primaryFromAddress = {
          addr: transaction.inputs[0].prev_out.addr,
          value: transaction.inputs[0].prev_out.value || 0
        };
      }
    }
    
    return { totalInput, totalOutput, fee, primaryToAddress, primaryFromAddress };
  }, [transaction]);

  return (
    <TransactionContainer>
      <TransactionSummary onClick={toggleExpand}>
        <TransactionIcon>
          {isExpanded ? '−' : '+'}
        </TransactionIcon>
        
        <TransactionData>
          <TransactionId title={transaction.hash || transaction.txid}>
            {truncateMiddle(transaction.hash || transaction.txid, 20, 20)}
          </TransactionId>
          
          <TransactionDetails>
            <TransactionTime>
              {transaction.time ? formatTimestamp(transaction.time) : 'Pending confirmation'}
            </TransactionTime>
            
            <TransactionFromAddress title={primaryFromAddress.addr}>
              From: {truncateMiddle(primaryFromAddress.addr, 12, 12)}
            </TransactionFromAddress>
            
            <TransactionToAddress title={primaryToAddress.addr}>
              To: {truncateMiddle(primaryToAddress.addr, 12, 12)}
            </TransactionToAddress>
            
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
              <DetailValue>{transaction.hash || transaction.txid}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Received Time:</DetailLabel>
              <DetailValue>{transaction.time ? formatTimestamp(transaction.time) : 'Pending'}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>From Address:</DetailLabel>
              <DetailValue>
                <AddressHighlight className="from">{primaryFromAddress.addr}</AddressHighlight>
                {primaryFromAddress.value ? ` (${formatBtcAmount(primaryFromAddress.value)})` : ''}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>To Address:</DetailLabel>
              <DetailValue>
                <AddressHighlight>{primaryToAddress.addr}</AddressHighlight>
                {primaryToAddress.value ? ` (${formatBtcAmount(primaryToAddress.value)})` : ''}
              </DetailValue>
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
              <DetailValue>{transaction.size || 'Unknown'} bytes</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Weight:</DetailLabel>
              <DetailValue>{transaction.weight || 'N/A'} WU</DetailValue>
            </DetailRow>
          </DetailSection>
          
          {/* Inputs Section */}
          <InputsOutputsSection>
            <SectionTitle>Inputs ({getInputsLength(transaction)})</SectionTitle>
            <ScrollableList>
              {renderInputs(transaction)}
            </ScrollableList>
          </InputsOutputsSection>
          
          {/* Outputs Section */}
          <InputsOutputsSection>
            <SectionTitle>Outputs ({getOutputsLength(transaction)})</SectionTitle>
            <ScrollableList>
              {renderOutputs(transaction)}
            </ScrollableList>
          </InputsOutputsSection>
        </TransactionExpanded>
      )}
    </TransactionContainer>
  );
};

// Helper function to get inputs length
function getInputsLength(transaction) {
  return transaction.inputs?.length || 0;
}

// Helper function to get outputs length
function getOutputsLength(transaction) {
  return transaction.out?.length || transaction.outputs?.length || 0;
}

// Helper function to render inputs based on Blockchain.info API structure
function renderInputs(transaction) {
  // For coinbase transactions (newly minted coins)
  const isCoinbase = transaction.is_coinbase || 
                    (transaction.inputs && transaction.inputs[0] && 
                     (transaction.inputs[0].coinbase || !transaction.inputs[0].prev_out));
  
  if (isCoinbase) {
    return (
      <AddressItem>
        <AddressHash title="Coinbase Transaction (New Bitcoins)">
          <FromLabel>COINBASE: </FromLabel>
          Newly Generated Coins
        </AddressHash>
        {transaction.out && transaction.out.length > 0 && (
          <AddressAmount>
            {formatBtcAmount(transaction.out.reduce((sum, out) => sum + (out.value || 0), 0))}
          </AddressAmount>
        )}
      </AddressItem>
    );
  }
  
  // Standard transaction inputs using Blockchain.info structure
  if (transaction.inputs && transaction.inputs.length) {
    return transaction.inputs.map((input, index) => {
      // Handle different address formats
      let address = 'Unknown Address';
      let value = 0;
      
      if (input.prev_out) {
        address = input.prev_out.addr || 'Unknown Address';
        value = input.prev_out.value || 0;
      }
      
      return (
        <AddressItem key={index}>
          <AddressHash title={address}>
            {index === 0 && <FromLabel>FROM: </FromLabel>}
            {truncateMiddle(address, 18, 18)}
          </AddressHash>
          {value > 0 && (
            <AddressAmount>{formatBtcAmount(value)}</AddressAmount>
          )}
        </AddressItem>
      );
    });
  }
  
  return <EmptyMessage>No inputs data available</EmptyMessage>;
}

// Helper function to render outputs based on Blockchain.info API structure
function renderOutputs(transaction) {
  // Use out array from Blockchain.info raw format
  if (transaction.out && transaction.out.length) {
    return transaction.out.map((output, index) => {
      // Handle different address formats
      let address = 'Unknown Address';
      
      if (output.addr) {
        address = output.addr;
      } else if (output.script) {
        // If we have a script but no address, it might be a complex output type
        address = 'Script Output';
      }
      
      const value = output.value || 0;
      
      return (
        <AddressItem key={index} isPrimary={index === 0}>
          <AddressHash title={address}>
            {index === 0 && <OutputLabel>TO: </OutputLabel>}
            {truncateMiddle(address, 18, 18)}
          </AddressHash>
          {value > 0 && (
            <AddressAmount>{formatBtcAmount(value)}</AddressAmount>
          )}
        </AddressItem>
      );
    });
  }
  
  // Fallback for other API formats
  if (transaction.outputs && transaction.outputs.length) {
    return transaction.outputs.map((output, index) => {
      const address = output.addr || 'Unknown Address';
      const value = output.value || 0;
      
      return (
        <AddressItem key={index} isPrimary={index === 0}>
          <AddressHash title={address}>
            {index === 0 && <OutputLabel>TO: </OutputLabel>}
            {truncateMiddle(address, 18, 18)}
          </AddressHash>
          {value > 0 && (
            <AddressAmount>{formatBtcAmount(value)}</AddressAmount>
          )}
        </AddressItem>
      );
    });
  }
  
  return <EmptyMessage>No outputs data available</EmptyMessage>;
}

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
  padding-bottom: 4px;
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

const TransactionFromAddress = styled.div`
  margin-right: 1.5rem;
  font-family: monospace;
  color: ${({ theme }) => theme.colors.warning};
  font-weight: 600;
`;

const TransactionToAddress = styled.div`
  margin-right: 1.5rem;
  font-family: monospace;
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
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

const AddressHighlight = styled.span`
  font-family: monospace;
  font-weight: 600;
  color: ${({ theme, className }) => 
    className === "from" ? theme.colors.warning : theme.colors.success};
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
  background-color: ${({ theme, isPrimary }) => 
    isPrimary ? theme.colors.backgroundSuccess : 'inherit'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(odd):not(:first-child) {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const AddressHash = styled.div`
  font-family: monospace;
  display: flex;
  align-items: center;
`;

const OutputLabel = styled.span`
  font-weight: 700;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.colors.success};
`;

const FromLabel = styled.span`
  font-weight: 700;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.colors.warning};
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