import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as formatters from './formatters';

describe('Formatters Utility Functions', () => {
  beforeEach(() => {
    // Reset any mocks between tests
    vi.resetAllMocks();
    // Mock Date.now() for consistent testing of time-based functions
    const mockNow = new Date('2025-05-14T12:00:00Z').getTime();
    vi.spyOn(Date, 'now').mockImplementation(() => mockNow);
  });

  describe('formatTimestamp', () => {
    it('formats Unix timestamp to readable date string', () => {
      // Account for timezone differences by checking the date format pattern instead of exact values
      const result = formatters.formatTimestamp(1715593855);
      
      // Check that the result matches the expected format: YYYY-MM-DD HH:MM
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      
      // Verify it contains the correct date (May 13, 2024)
      expect(result).toContain('2024-05-13');
    });

    it('handles null or undefined values', () => {
      expect(formatters.formatTimestamp(null)).toBe('Unknown');
      expect(formatters.formatTimestamp(undefined)).toBe('Unknown');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousands separators', () => {
      expect(formatters.formatNumber(1000)).toBe('1,000');
      expect(formatters.formatNumber(1000000)).toBe('1,000,000');
      expect(formatters.formatNumber(1234567890)).toBe('1,234,567,890');
    });

    it('handles zero correctly', () => {
      expect(formatters.formatNumber(0)).toBe('0');
    });

    it('handles null or undefined values', () => {
      expect(formatters.formatNumber(null)).toBe('Unknown');
      expect(formatters.formatNumber(undefined)).toBe('Unknown');
    });
  });

  describe('formatFileSize', () => {
    it('formats small byte values correctly', () => {
      expect(formatters.formatFileSize(100)).toBe('100 B');
      expect(formatters.formatFileSize(1023)).toBe('1023 B');
    });

    it('formats kilobyte values correctly', () => {
      expect(formatters.formatFileSize(1024)).toBe('1.00 KB');
      expect(formatters.formatFileSize(1536)).toBe('1.50 KB');
      expect(formatters.formatFileSize(10240)).toBe('10.00 KB');
    });

    it('formats megabyte values correctly', () => {
      expect(formatters.formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatters.formatFileSize(2097152)).toBe('2.00 MB');
    });

    it('formats gigabyte values correctly', () => {
      expect(formatters.formatFileSize(1073741824)).toBe('1.00 GB');
      expect(formatters.formatFileSize(10737418240)).toBe('10.00 GB');
    });

    it('handles null or undefined values', () => {
      expect(formatters.formatFileSize(null)).toBe('Unknown');
      expect(formatters.formatFileSize(undefined)).toBe('Unknown');
    });
  });

  describe('formatBtcAmount', () => {
    it('converts satoshis to BTC correctly', () => {
      expect(formatters.formatBtcAmount(100000000)).toBe('1.00000000 BTC');
      expect(formatters.formatBtcAmount(50000000)).toBe('0.50000000 BTC');
      expect(formatters.formatBtcAmount(1)).toBe('0.00000001 BTC');
      expect(formatters.formatBtcAmount(123456789)).toBe('1.23456789 BTC');
    });

    it('handles zero correctly', () => {
      expect(formatters.formatBtcAmount(0)).toBe('0.00000000 BTC');
    });

    it('handles null or undefined values', () => {
      expect(formatters.formatBtcAmount(null)).toBe('Unknown');
      expect(formatters.formatBtcAmount(undefined)).toBe('Unknown');
    });
  });

  describe('truncateMiddle', () => {
    it('truncates long strings with ellipsis in the middle', () => {
      const longHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      expect(formatters.truncateMiddle(longHash, 6, 6)).toBe('123456...abcdef');
      expect(formatters.truncateMiddle(longHash, 10, 8)).toBe('1234567890...90abcdef');
    });

    it('does not truncate strings shorter than the limit', () => {
      expect(formatters.truncateMiddle('1234567890', 6, 6)).toBe('1234567890');
      expect(formatters.truncateMiddle('12345', 3, 3)).toBe('12345');
    });

    it('handles empty strings', () => {
      expect(formatters.truncateMiddle('')).toBe('');
    });

    it('handles null or undefined values', () => {
      expect(formatters.truncateMiddle(null)).toBe('');
      expect(formatters.truncateMiddle(undefined)).toBe('');
    });

    it('uses default parameters when not provided', () => {
      const longString = '1234567890abcdef1234567890abcdef';
      expect(formatters.truncateMiddle(longString)).toBe('123456...abcdef');
    });
  });

  describe('identifyMiner', () => {
    it('identifies common miners from coinbase data', () => {
      // Test hex representations of known miners
      expect(formatters.identifyMiner('466f756e647279')).toBe('Foundry USA');
      expect(formatters.identifyMiner('2f416e74506f6f6c2f')).toBe('AntPool');
      expect(formatters.identifyMiner('2f4632506f6f6c2f')).toBe('F2Pool');
      expect(formatters.identifyMiner('2f42696e616e63652f')).toBe('Binance Pool');
    });

    it('returns "Unknown Miner" for unidentifiable data', () => {
      expect(formatters.identifyMiner('xxxxxx')).toBe('Unknown Miner');
      expect(formatters.identifyMiner('')).toBe('Unknown Miner');
    });

    it('identifies miners from raw block data with known addresses', () => {
      const mockBlockData = {
        tx: [{
          out: [{
            addr: '1CK6KHY6MHgYvmRQ4PAafKYDrg1ejbH1cE'
          }]
        }]
      };
      expect(formatters.identifyMiner('', mockBlockData)).toBe('SlushPool');
    });

    it('handles invalid inputs gracefully', () => {
      expect(formatters.identifyMiner(null)).toBe('Unknown Miner');
      expect(formatters.identifyMiner(undefined)).toBe('Unknown Miner');
      expect(formatters.identifyMiner(123)).toBe('Unknown Miner');
    });
  });

  describe('formatTimeAgo', () => {
    it('formats recent timestamps correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatters.formatTimeAgo(now)).toBe('Just now');
      expect(formatters.formatTimeAgo(now - 30)).toBe('30 seconds ago');
      expect(formatters.formatTimeAgo(now - 60)).toBe('1 minute ago');
      expect(formatters.formatTimeAgo(now - 120)).toBe('2 minutes ago');
    });

    it('formats hours, days, weeks correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatters.formatTimeAgo(now - 3600)).toBe('1 hour ago');
      expect(formatters.formatTimeAgo(now - 7200)).toBe('2 hours ago');
      expect(formatters.formatTimeAgo(now - 86400)).toBe('1 day ago');
      expect(formatters.formatTimeAgo(now - 172800)).toBe('2 days ago');
      expect(formatters.formatTimeAgo(now - 604800)).toBe('1 week ago');
      expect(formatters.formatTimeAgo(now - 1209600)).toBe('2 weeks ago');
    });

    it('formats months and years correctly', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatters.formatTimeAgo(now - 2592000)).toBe('1 month ago');
      expect(formatters.formatTimeAgo(now - 5184000)).toBe('2 months ago');
      expect(formatters.formatTimeAgo(now - 31536000)).toBe('1 year ago');
      expect(formatters.formatTimeAgo(now - 63072000)).toBe('2 years ago');
    });

    it('handles null or undefined values', () => {
      expect(formatters.formatTimeAgo(null)).toBe('Unknown');
      expect(formatters.formatTimeAgo(undefined)).toBe('Unknown');
    });
  });

  describe('calculateDifficulty', () => {
    it('calculates difficulty from bits hexadecimal value', () => {
      // Test with a known bits value from a historical block
      const result = formatters.calculateDifficulty('0x1a015f53');
      expect(typeof result).toBe('number');
      // Result should be approximately 12.2 million for this bits value
      expect(result).toBeGreaterThan(12000000);
      expect(result).toBeLessThan(12500000);
    });

    it('calculates difficulty from block object with bits property', () => {
      const blockData = { bits: '0x1a015f53' };
      const result = formatters.calculateDifficulty(blockData);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('handles decimal bits value', () => {
      const decimalBits = 436253907; // 0x1a015f53 in decimal
      const result = formatters.calculateDifficulty(decimalBits);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('returns 0 for invalid input', () => {
      expect(formatters.calculateDifficulty(null)).toBe(0);
      expect(formatters.calculateDifficulty(undefined)).toBe(0);
      expect(formatters.calculateDifficulty({})).toBe(0);
      expect(formatters.calculateDifficulty('invalid')).toBe(0);
    });
  });
});