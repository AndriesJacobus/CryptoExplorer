import React, { memo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { formatTimestamp, formatNumber, truncateMiddle, identifyMiner, formatTimeAgo } from '../utils/formatters';
import BlockCard from './BlockCard';
import { slideInFromLeft, createSequencedAnimation } from '../styles/animations';

/**
 * BlockTable component to display blocks in a table format
 * Wrapped with React.memo for performance optimization
 */
const BlockTable = ({ blocks, isLoading }) => {
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animatedBlocks, setAnimatedBlocks] = useState({});
  const prevBlocksRef = useRef([]);

  // Detect new blocks and mark them for animation
  useEffect(() => {
    if (!blocks || blocks.length === 0) return;
    
    // Filter only new blocks that weren't in the previous blocks array
    const prevBlockHashes = new Set(prevBlocksRef.current.map(block => block.hash));
    const newBlocks = blocks.filter(block => !prevBlockHashes.has(block.hash));
    
    // Mark new blocks for animation with a sequential index
    if (newBlocks.length > 0) {
      const newAnimatedBlocks = {};
      
      // Sort new blocks by height (descending) to ensure proper animation sequence
      const sortedNewBlocks = [...newBlocks].sort((a, b) => b.height - a.height);
      
      // Assign animation index to each new block
      sortedNewBlocks.forEach((block, index) => {
        newAnimatedBlocks[block.hash] = index;
      });
      
      setAnimatedBlocks(newAnimatedBlocks);
      
      // Clear animation flags after all animations complete
      // Base time (0.5s per block) + small buffer
      const animationDuration = sortedNewBlocks.length * 0.5 + 0.5;
      setTimeout(() => {
        setAnimatedBlocks({});
      }, animationDuration * 1000);
    }
    
    // Update ref with current blocks for next comparison
    prevBlocksRef.current = [...blocks];
  }, [blocks]);

  const handleMouseEnter = (block, e) => {
    setHoveredBlock(block);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredBlock(null);
  };

  const handleMouseMove = (e) => {
    if (hoveredBlock) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingMessage>Loading blocks...</LoadingMessage>
      </LoadingContainer>
    );
  }

  if (!blocks || blocks.length === 0) {
    return <EmptyMessage>No blocks found</EmptyMessage>;
  }

  return (
    <TableContainer>
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableHeader>Height</TableHeader>
            <TableHeader>Hash</TableHeader>
            <TableHeader>Mined</TableHeader>
            <TableHeader>Miner</TableHeader>
            <TableHeader>Size</TableHeader>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {blocks.map((block) => (
            <TableRow 
              key={block.hash} 
              onMouseEnter={(e) => handleMouseEnter(block, e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              isNew={animatedBlocks[block.hash] !== undefined}
              animationIndex={animatedBlocks[block.hash]}
            >
              <TableCell>
                <HeightLink to={`/btc/block/${block.hash}`}>
                  #{formatNumber(block.height)}
                </HeightLink>
              </TableCell>
              
              <TableCell>
                <HashLink to={`/btc/block/${block.hash}`}>
                  {truncateMiddle(block.hash, 10, 10)}
                </HashLink>
              </TableCell>
              
              <TableCell title={formatTimestamp(block.timestamp)}>
                {formatTimeAgo(block.time)}
              </TableCell>
              
              <TableCell>
                {identifyMiner(block.coinbase || '')}
              </TableCell>
              
              <TableCell>
                {formatNumber(block.size || 0)} bytes
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>

      {/* Block Card Tooltip */}
      {hoveredBlock && (
        <TooltipContainer
          x={mousePosition.x}
          y={mousePosition.y}
          onClick={(e) => e.stopPropagation()}
        >
          <BlockCard block={hoveredBlock} isTooltip={true} />
        </TooltipContainer>
      )}
    </TableContainer>
  );
};

// Styled components
const TableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.white};
  position: relative;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.backgroundLight};
`;

const TableBody = styled.tbody`
  tr:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const TableRow = styled.tr`
  transition: background-color 0.2s;
  
  ${({ isNew, animationIndex, theme }) => isNew && createSequencedAnimation(
    slideInFromLeft,
    0.5,
    animationIndex,
    0.3,
    theme.colors.primary + '22'
  )}
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  vertical-align: middle;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeightLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HashLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: monospace;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TooltipContainer = styled.div`
  position: fixed;
  z-index: 1000;
  top: ${({ y }) => `${y + 20}px`};
  left: ${({ x }) => `${x + 20}px`};
  transform: translateX(-50%);
  width: 380px;
  pointer-events: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
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

const LoadingMessage = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.textLight};
`;

export default memo(BlockTable);