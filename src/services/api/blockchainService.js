import axios from 'axios';
import { categorizeError, logError } from './errorHandlingService';
import { identifyMiner, calculateDifficulty } from '../../utils/formatters';

// Create an axios instance with default configuration
const api = axios.create({
  timeout: 10000, // 10 seconds
});

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response, // Pass successful responses through
  (error) => {
    // Process and categorize the error
    const categorizedError = categorizeError(error);
    // Log the error (would send to monitoring in production)
    logError(categorizedError);
    // Reject the promise with our enhanced error object
    return Promise.reject(categorizedError);
  }
);

// API endpoints as specified in the implementation plan
const ENDPOINTS = {
  LATEST_BLOCKS: 'https://api.blockchain.info/haskoin-store/btc/block/heights?notx=true&cors=true',
  BLOCK_DETAILS: 'https://api.blockchain.info/haskoin-store/btc/block',
  TRANSACTIONS: 'https://api.blockchain.info/haskoin-store/btc/transactions',
  // New endpoints for miner identification
  RAW_TX: 'https://blockchain.info/rawtx',
  RAW_BLOCK: 'https://blockchain.info/rawblock',
  CURRENT_HEIGHT: 'https://api.blockchain.info/q/getblockcount',
};

/**
 * Calculate transaction volume from raw block data
 * Sums all outputs from non-coinbase transactions
 * @param {Object} rawBlockData - The raw block data containing transactions
 * @returns {number} - Total transaction volume
 */
const calculateTransactionVolume = (rawBlockData) => {
  let transactionVolume = 0;
  
  if (rawBlockData?.tx && rawBlockData.tx.length > 0) {
    // Skip coinbase transaction (first transaction) when calculating volume
    for (let i = 1; i < rawBlockData.tx.length; i++) {
      const tx = rawBlockData.tx[i];
      if (tx.out && tx.out.length > 0) {
        for (const output of tx.out) {
          if (output.value) {
            transactionVolume += output.value;
          }
        }
      }
    }
  }
  
  return transactionVolume;
};

/**
 * Get the latest blocks from the blockchain
 * @param {number} count - Number of latest blocks to fetch
 * @returns {Promise} - Promise resolving to the latest blocks
 */
export const getLatestBlocks = async (count = 10) => {
  // Get the current block height first
  const latestBlockResponse = await api.get(ENDPOINTS.CURRENT_HEIGHT);
  const latestBlockHeight = parseInt(latestBlockResponse.data, 10);
  
  // Create an array of the latest block heights
  const blockHeights = Array.from(
    { length: count }, 
    (_, i) => latestBlockHeight - i
  ).join(',');
  
  // Fetch the blocks data
  const response = await api.get(`${ENDPOINTS.LATEST_BLOCKS}&heights=${blockHeights}`);

  // For each block, fetch additional information
  const blocksWithEnhancedInfo = await Promise.all(
    response.data.map(async (block) => {
      try {
        // Fetch raw block data with coinbase transaction
        const rawBlockData = await getRawBlockData(block.hash);
        
        // Calculate transaction volume using helper function
        const transactionVolume = calculateTransactionVolume(rawBlockData);
        
        // Calculate confirmations
        const confirmations = latestBlockHeight - block.height + 1;
        
        // Add enhanced information to the block
        return {
          ...block,
          miner: identifyMinerFromRawBlock(rawBlockData),
          coinbase: rawBlockData.tx && rawBlockData.tx[0] ? rawBlockData.tx[0].inputs[0].script : '',
          difficulty: calculateDifficulty(rawBlockData) || block.difficulty,
          confirmations,
          transactionVolume
        };
      } catch (error) {
        console.error(`Error fetching additional info for block ${block.hash}:`, error);
        return block; // Return original block if we can't get additional info
      }
    })
  );
  
  return blocksWithEnhancedInfo;
};

/**
 * Get raw block data including coinbase transaction for miner identification
 * @param {string} blockHash - The hash of the block
 * @returns {Promise} - Promise resolving to the raw block data
 */
export const getRawBlockData = async (blockHash) => {
  const response = await api.get(`${ENDPOINTS.RAW_BLOCK}/${blockHash}?cors=true`);
  return response.data;
};

/**
 * Get raw transaction data by hash
 * @param {string} txHash - The transaction hash
 * @returns {Promise} - Promise resolving to the raw transaction data
 */
export const getRawTransactionData = async (txHash) => {
  const response = await api.get(`${ENDPOINTS.RAW_TX}/${txHash}?cors=true`);
  return response.data;
};

/**
 * Identify miner from raw block data
 * @param {Object} blockData - The raw block data
 * @returns {string} - The identified miner name
 */
export const identifyMinerFromRawBlock = (blockData) => {
  if (!blockData || !blockData.tx || blockData.tx.length === 0) {
    return 'Unknown Miner';
  }
  
  // The first transaction is the coinbase transaction
  const coinbaseTx = blockData.tx[0];
  
  // Get the coinbase data (script from first input)
  const coinbaseInput = coinbaseTx.inputs && coinbaseTx.inputs[0];
  const coinbaseScript = coinbaseInput ? coinbaseInput.script : '';
  
  // Use utility function to identify miner from coinbase data
  return identifyMiner(coinbaseScript) || 'Mining Pool'; // Use the imported identifyMiner function
};

/**
 * Get block details by hash
 * @param {string} blockHash - The hash of the block to fetch
 * @returns {Promise} - Promise resolving to the block details
 */
export const getBlockByHash = async (blockHash) => {
  try {
    // Get standard block details
    const response = await api.get(`${ENDPOINTS.BLOCK_DETAILS}/${blockHash}?cors=true`);
    const blockData = response.data;
    
    // Get raw block data for additional information
    const rawBlockData = await getRawBlockData(blockHash);
    
    // Get current block height to calculate confirmations
    const latestBlockResponse = await api.get(ENDPOINTS.CURRENT_HEIGHT);
    const latestBlockHeight = parseInt(latestBlockResponse.data, 10);
    const confirmations = latestBlockHeight - blockData.height + 1;
    
    // Calculate transaction volume using helper function
    const transactionVolume = calculateTransactionVolume(rawBlockData);
    
    // Add enhanced information to the block
    return {
      ...blockData,
      miner: identifyMinerFromRawBlock(rawBlockData),
      coinbase: rawBlockData.tx && rawBlockData.tx[0] ? rawBlockData.tx[0].inputs[0].script : '',
      difficulty: calculateDifficulty(rawBlockData) || blockData.difficulty,
      confirmations,
      transactionVolume
    };
  } catch (error) {
    console.error(`Error fetching block ${blockHash}:`, error);
    throw error;
  }
};

/**
 * Get block details by height
 * @param {number} blockHeight - The height of the block to fetch
 * @returns {Promise} - Promise resolving to the block details
 */
export const getBlockByHeight = async (blockHeight) => {
  try {
    const response = await api.get(`${ENDPOINTS.BLOCK_DETAILS}/height/${blockHeight}?cors=true`);
    const blockData = response.data;
    
    // Get raw block data for additional information
    const rawBlockData = await getRawBlockData(blockData.hash);
    
    // Get current block height to calculate confirmations
    const latestBlockResponse = await api.get(ENDPOINTS.CURRENT_HEIGHT);
    const latestBlockHeight = parseInt(latestBlockResponse.data, 10);
    const confirmations = latestBlockHeight - blockHeight + 1;
    
    // Calculate transaction volume using helper function
    const transactionVolume = calculateTransactionVolume(rawBlockData);
    
    // Add enhanced information to the block
    return {
      ...blockData,
      miner: identifyMinerFromRawBlock(rawBlockData),
      coinbase: rawBlockData.tx && rawBlockData.tx[0] ? rawBlockData.tx[0].inputs[0].script : '',
      difficulty: calculateDifficulty(rawBlockData) || blockData.difficulty,
      confirmations,
      transactionVolume
    };
  } catch (error) {
    console.error(`Error fetching block at height ${blockHeight}:`, error);
    throw error;
  }
};

/**
 * Get transaction details by transaction ID
 * @param {string} txId - The transaction ID
 * @returns {Promise} - Promise resolving to the transaction details
 */
export const getTransactionById = async (txId) => {
  const response = await api.get(`${ENDPOINTS.TRANSACTIONS}?txids=${txId}&cors=true`);
  return response.data;
};

/**
 * Get multiple transactions by their transaction IDs
 * @param {Array<string>} txIds - Array of transaction IDs
 * @returns {Promise} - Promise resolving to the transactions details
 */
export const getTransactionsByIds = async (txIds) => {
  if (!Array.isArray(txIds) || txIds.length === 0) {
    return [];
  }
  
  try {
    // Use raw transaction endpoint for better address information
    const transactions = await Promise.all(
      txIds.map(async (txId) => {
        try {
          // Get rich transaction data from the rawTx endpoint
          const response = await api.get(`${ENDPOINTS.RAW_TX}/${txId}?cors=true`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching transaction ${txId}:`, error);
          // Fallback to the regular transaction endpoint if raw tx fails
          try {
            const fallbackResponse = await api.get(`${ENDPOINTS.TRANSACTIONS}?txids=${txId}&cors=true`);
            return fallbackResponse.data[0] || null;
          } catch (fallbackError) {
            console.error(`Fallback also failed for transaction ${txId}:`, fallbackError);
            return null;
          }
        }
      })
    );
    
    // Filter out any null values from failed requests
    return transactions.filter(tx => tx !== null);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

/**
 * Get additional blocks starting from a specific height
 * @param {number} startHeight - The height to start fetching from
 * @param {number} count - Number of additional blocks to fetch
 * @returns {Promise} - Promise resolving to the additional blocks
 */
export const getAdditionalBlocks = async (startHeight, count = 10) => {
  if (!startHeight || startHeight <= 0) {
    // If no valid starting height, just get latest blocks
    return getLatestBlocks(count);
  }
  
  // Create an array of the block heights we want to fetch
  const blockHeights = Array.from(
    { length: count }, 
    (_, i) => startHeight - i - 1 // -1 because we want to start after the last block we already have
  ).join(',');
  
  // Fetch the blocks data
  const response = await api.get(`${ENDPOINTS.LATEST_BLOCKS}&heights=${blockHeights}`);

  // Get current block height to calculate confirmations
  const latestBlockResponse = await api.get(ENDPOINTS.CURRENT_HEIGHT);
  const latestBlockHeight = parseInt(latestBlockResponse.data, 10);

  // For each block, fetch additional information
  const blocksWithEnhancedInfo = await Promise.all(
    response.data.map(async (block) => {
      try {
        // Fetch raw block data with coinbase transaction
        const rawBlockData = await getRawBlockData(block.hash);
        
        // Calculate transaction volume using helper function
        const transactionVolume = calculateTransactionVolume(rawBlockData);
        
        // Calculate confirmations
        const confirmations = latestBlockHeight - block.height + 1;
        
        // Add enhanced information to the block
        return {
          ...block,
          miner: identifyMinerFromRawBlock(rawBlockData),
          coinbase: rawBlockData.tx && rawBlockData.tx[0] ? rawBlockData.tx[0].inputs[0].script : '',
          difficulty: calculateDifficulty(rawBlockData) || block.difficulty,
          confirmations,
          transactionVolume
        };
      } catch (error) {
        console.error(`Error fetching additional info for block ${block.hash}:`, error);
        return block; // Return original block if we can't get additional info
      }
    })
  );
  
  return blocksWithEnhancedInfo;
};

/**
 * Check for and get newer blocks since the specified height
 * @param {number} highestKnownHeight - The highest block height we currently have
 * @param {number} maxCount - Maximum number of new blocks to fetch
 * @returns {Promise} - Promise resolving to any newer blocks
 */
export const getNewerBlocks = async (highestKnownHeight, maxCount = 10) => {
  if (!highestKnownHeight) {
    return [];
  }
  
  try {
    // Get current block height
    const latestBlockResponse = await api.get(ENDPOINTS.CURRENT_HEIGHT);
    const latestBlockHeight = parseInt(latestBlockResponse.data, 10);
    
    // If there are no new blocks, return empty array
    if (latestBlockHeight <= highestKnownHeight) {
      return [];
    }
    
    // Calculate how many new blocks there are
    const newBlocksCount = Math.min(latestBlockHeight - highestKnownHeight, maxCount);
    
    // Create an array of the new block heights
    const blockHeights = Array.from(
      { length: newBlocksCount }, 
      (_, i) => latestBlockHeight - i
    ).join(',');
    
    // Fetch the new blocks data
    const response = await api.get(`${ENDPOINTS.LATEST_BLOCKS}&heights=${blockHeights}`);
    
    // For each block, fetch additional information
    const blocksWithEnhancedInfo = await Promise.all(
      response.data.map(async (block) => {
        try {
          // Fetch raw block data with coinbase transaction
          const rawBlockData = await getRawBlockData(block.hash);
          
          // Calculate transaction volume using helper function
          const transactionVolume = calculateTransactionVolume(rawBlockData);
          
          // Calculate confirmations
          const confirmations = latestBlockHeight - block.height + 1;
          
          // Add enhanced information to the block
          return {
            ...block,
            miner: identifyMinerFromRawBlock(rawBlockData),
            coinbase: rawBlockData.tx && rawBlockData.tx[0] ? rawBlockData.tx[0].inputs[0].script : '',
            difficulty: calculateDifficulty(rawBlockData) || block.difficulty,
            confirmations,
            transactionVolume
          };
        } catch (error) {
          console.error(`Error fetching additional info for block ${block.hash}:`, error);
          return block; // Return original block if we can't get additional info
        }
      })
    );
    
    return blocksWithEnhancedInfo;
  } catch (error) {
    console.error('Error fetching newer blocks:', error);
    return [];
  }
};

export default {
  getLatestBlocks,
  getBlockByHash,
  getBlockByHeight,
  getTransactionById,
  getTransactionsByIds,
  getAdditionalBlocks,
  getNewerBlocks, // Add the new function to the default export
};
