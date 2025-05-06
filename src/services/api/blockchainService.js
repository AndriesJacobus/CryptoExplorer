import axios from 'axios';
import { categorizeError, logError } from './errorHandlingService';

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
};

/**
 * Get the latest blocks from the blockchain
 * @param {number} count - Number of latest blocks to fetch
 * @returns {Promise} - Promise resolving to the latest blocks
 */
export const getLatestBlocks = async (count = 10) => {
  // Get the current block height first
  const latestBlockResponse = await api.get('https://api.blockchain.info/q/getblockcount');
  const latestBlockHeight = parseInt(latestBlockResponse.data, 10);
  
  // Create an array of the latest block heights
  const blockHeights = Array.from(
    { length: count }, 
    (_, i) => latestBlockHeight - i
  ).join(',');
  
  // Fetch the blocks data
  const response = await api.get(`${ENDPOINTS.LATEST_BLOCKS}&heights=${blockHeights}`);
  return response.data;
};

/**
 * Get block details by hash
 * @param {string} blockHash - The hash of the block to fetch
 * @returns {Promise} - Promise resolving to the block details
 */
export const getBlockByHash = async (blockHash) => {
  const response = await api.get(`${ENDPOINTS.BLOCK_DETAILS}/${blockHash}?cors=true`);
  return response.data;
};

/**
 * Get block details by height
 * @param {number} blockHeight - The height of the block to fetch
 * @returns {Promise} - Promise resolving to the block details
 */
export const getBlockByHeight = async (blockHeight) => {
  const response = await api.get(`${ENDPOINTS.BLOCK_DETAILS}/height/${blockHeight}?cors=true`);
  return response.data;
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
  
  // API limits the number of transactions, so we might need to batch requests
  const MAX_TX_IDS_PER_REQUEST = 10;
  
  if (txIds.length <= MAX_TX_IDS_PER_REQUEST) {
    const response = await api.get(`${ENDPOINTS.TRANSACTIONS}?txids=${txIds.join(',')}&cors=true`);
    return response.data;
  }
  
  // For large numbers of transactions, batch the requests
  const batches = [];
  for (let i = 0; i < txIds.length; i += MAX_TX_IDS_PER_REQUEST) {
    const batchIds = txIds.slice(i, i + MAX_TX_IDS_PER_REQUEST);
    batches.push(api.get(`${ENDPOINTS.TRANSACTIONS}?txids=${batchIds.join(',')}&cors=true`));
  }
  
  const responses = await Promise.all(batches);
  // Combine all transaction data from multiple responses
  return responses.flatMap(response => response.data);
};

export default {
  getLatestBlocks,
  getBlockByHash,
  getBlockByHeight,
  getTransactionById,
  getTransactionsByIds,
};
