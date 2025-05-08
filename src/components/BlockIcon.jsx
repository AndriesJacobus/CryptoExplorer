import React from 'react';
import styled from 'styled-components';

/**
 * Bitcoin block icon component that resembles the official Bitcoin logo
 */
const BlockIcon = ({ size = 48 }) => {
  return (
    <IconContainer size={size}>
      <BitcoinSymbol>₿</BitcoinSymbol>
    </IconContainer>
  );
};

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: #F7931A; /* Bitcoin orange color */
  border-radius: 50%; /* Make it circular */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BitcoinSymbol = styled.span`
  color: white;
  font-size: ${props => props.theme.fontSizes.xxlarge * 1 || '2.5rem'};
  font-weight: bold;
  transform: rotate(12deg); /* Slight rotation as in the official logo */
  margin-top: -2px; /* Small adjustment to center the symbol */
  margin-left: 4px; /* Small adjustment to center the symbol */
`;

export default BlockIcon;