import { vi } from 'vitest';
import { mockBlockData, mockBlockDetails, mockTransactions } from './mockData';

/**
 * Mock implementation for blockchain API services
 */
export const mockBlockchainService = {
  getLatestBlocks: vi.fn().mockResolvedValue(mockBlockData.blocks),
  getBlockDetails: vi.fn().mockResolvedValue(mockBlockDetails),
  getTransactions: vi.fn().mockResolvedValue(mockTransactions),
};

/**
 * Mock implementation for crypto price API services
 */
export const mockCryptoService = {
  getBitcoinPrice: vi.fn().mockResolvedValue({ 
    USD: 42789.12, 
    EUR: 39432.56, 
    GBP: 33598.91
  }),
  getPriceHistory: vi.fn().mockResolvedValue([
    { timestamp: 1685541600, price: 42789.12 },
    { timestamp: 1685455200, price: 42189.35 },
    { timestamp: 1685368800, price: 41956.23 },
    { timestamp: 1685282400, price: 43001.67 },
    { timestamp: 1685196000, price: 43523.44 }
  ])
};

/**
 * Reset all mocks to their initial state
 * Called after each test in setup.js
 */
export function resetMocks() {
  // Reset blockchain service mocks
  mockBlockchainService.getLatestBlocks.mockClear();
  mockBlockchainService.getBlockDetails.mockClear();
  mockBlockchainService.getTransactions.mockClear();
  
  // Reset crypto service mocks
  mockCryptoService.getBitcoinPrice.mockClear();
  mockCryptoService.getPriceHistory.mockClear();
}

/**
 * Setup function to install API mocks in vitest
 */
export function setupApiMocks() {
  vi.mock('../../services/api/blockchainService', () => ({
    getLatestBlocks: mockBlockchainService.getLatestBlocks,
    getBlockDetails: mockBlockchainService.getBlockDetails,
    getTransactions: mockBlockchainService.getTransactions,
  }));

  vi.mock('../../services/api/cryptoService', () => ({
    getBitcoinPrice: mockCryptoService.getBitcoinPrice,
    getPriceHistory: mockCryptoService.getPriceHistory,
  }));
}