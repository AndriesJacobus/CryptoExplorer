/**
 * Format a timestamp to a human-readable date and time
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string (YYYY-MM-DD HH:MM)
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Format a number with thousands separators
 * @param {number} number - The number to format
 * @returns {string} Formatted number with commas as thousand separators
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return 'Unknown';
  return number.toLocaleString();
};

/**
 * Convert bytes to a human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size with units
 */
export const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return 'Unknown';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`;
};

/**
 * Format BTC amount (convert satoshis to BTC)
 * @param {number} satoshis - Amount in satoshis
 * @returns {string} Formatted amount in BTC
 */
export const formatBtcAmount = (satoshis) => {
  if (satoshis === undefined || satoshis === null) return 'Unknown';
  
  const btc = satoshis / 100000000;
  return `${btc.toFixed(8)} BTC`;
};

/**
 * Truncate a string (e.g. hash) with ellipsis in the middle
 * @param {string} str - String to truncate
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} Truncated string
 */
export const truncateMiddle = (str, startChars = 6, endChars = 6) => {
  if (!str) return '';
  if (str.length <= startChars + endChars) return str;
  
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
};

/**
 * Identify miner name from coinbase data or transaction
 * @param {string} coinbaseData - The coinbase script data from the block
 * @param {Object} rawBlockData - The raw block data (optional)
 * @returns {string} Miner name if identified, or "Unknown Miner"
 */
export const identifyMiner = (coinbaseData, rawBlockData = null) => {
  // Comprehensive database of mining pool signatures
  const minerSignatures = {
    // Major mining pools ASCII signatures
    'Foundry USA': ['Foundry USA', '/Foundry/', 'foundry.com'],
    'F2Pool': ['F2Pool', '/F2Pool/', 'f2pool.com'],
    'AntPool': ['AntPool', '/AntPool/', 'antpool.com'],
    'Binance Pool': ['Binance Pool', '/Binance/', 'binancepool', 'binance.com'],
    'ViaBTC': ['ViaBTC', '/ViaBTC/', 'viabtc.com'],
    'SlushPool': ['SlushPool', 'slushpool.com', 'braiins.com', '/slush/'],
    'Poolin': ['Poolin', '/Poolin/', 'poolin.com'],
    'BTC.com': ['BTC.com', '/BTC.com/', 'btc.com'],
    'OKExPool': ['OKExPool', 'okexpool', 'okex.com'],
    '1THash': ['1THash', '1thash.com'],
    'Huobi Pool': ['Huobi', 'huobipool', 'huobi.com'],
    'NovaBlock': ['NovaBlock', 'novablock'],
    'MARA Pool': ['MARA', 'Marathon', 'marapool'],
    'SBI Crypto': ['SBI Crypto', 'sbicrypto'],
    'Luxor': ['Luxor', 'luxor.tech'],
    'Bitdeer': ['Bitdeer', 'bitdeer.com'],
    'KuCoin Pool': ['KuCoin', 'kucoin.com'],
    'SigmaPool': ['SigmaPool', 'sigmapool.com'],
    'SpiderPool': ['SpiderPool', 'spider'],
  };

  // Common payout addresses used by mining pools
  const minerAddresses = {
    '1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY': 'Foundry USA',
    '12hRMvP7LKrSC2L9t6JrdgXhj1uVhP7gzh': 'F2Pool',
    '1CdCUXGx9kvx2uXAQKMiR6mBYAqkrNr3HU': 'AntPool',
    '1PMHA4kRwHGEPFjm3RvYUYvJZ1AEqLXurH': 'Binance Pool',
    '1JwUDjDDQ3FqGRMaNZhB7U44Jg8KFQTvNG': 'ViaBTC',
    '1CK6KHY6MHgYvmRQ4PAafKYDrg1ejbH1cE': 'SlushPool',
    '13hQVEstgo4iPQZv9C7VELnLWF7UWtF4Q3': 'Poolin',
    '1Hz96kJKF2HLPGY15JWLB5m9qGNxvt8tHJ': 'BTC.com',
    '1JLRXD8rjRgQtTS9MvfQALfHgGWau9L9ky': 'BTC.com',
    '1GC6HxDvnchDdb5cGkFXsJMZBFRsVMGSXs': 'OKExPool',
    '1M9iaetiEZZTfmRqWJQfQQ7ERmyLXZh1zz': 'Huobi Pool',
    '1Bf9sZvBHPFGVPX71WX2njhd1NXKv5y7v5': 'SBI Crypto',
    '1G8YpbkZd7bySHjpdQbgeyL1gEW9HjuAwt': 'Luxor',
    '1MiningRigSGkAZYkbNpsCLYKhRNYKqqTuX': 'MARA Pool',
    '1KsFhYKLs8qb1GHqrPxHoywNQpet2CtP9t': 'Binance Pool',
  };

  // Mining pool hex signatures (direct hex pattern matching)
  const minerHexPatterns = [
    { pattern: '466f756e647279', name: 'Foundry USA' },       // 'Foundry' in hex
    { pattern: '4632506f6f6c', name: 'F2Pool' },              // 'F2Pool' in hex
    { pattern: '416e74506f6f6c', name: 'AntPool' },           // 'AntPool' in hex
    { pattern: '42696e616e6365', name: 'Binance Pool' },      // 'Binance' in hex
    { pattern: '5669614254432f', name: 'ViaBTC' },            // 'ViaBTC/' in hex
    { pattern: '536c757368506f6f6c', name: 'SlushPool' },     // 'SlushPool' in hex
    { pattern: '506f6f6c696e', name: 'Poolin' },              // 'Poolin' in hex
    { pattern: '2f4254432e636f6d2f', name: 'BTC.com' },       // '/BTC.com/' in hex
    { pattern: '2f426974446565722f', name: 'Bitdeer' },       // '/Bitdeer/' in hex
    { pattern: '2f4c75786f722f', name: 'Luxor' },             // '/Luxor/' in hex
    { pattern: '2f42544343454e5452414c2f', name: 'BTCC' },    // '/BTCCENTRAL/' in hex
    { pattern: '6d6172617468', name: 'MARA Pool' },           // 'marath' in hex
    { pattern: '4b75636f696e', name: 'KuCoin Pool' },         // 'Kucoin' in hex
    { pattern: '7370696465', name: 'SpiderPool' },            // 'spide' in hex
    // Common strings found in coinbase with slashes
    { pattern: '2f466f756e6472792f', name: 'Foundry USA' },   // '/Foundry/' in hex
    { pattern: '2f4632506f6f6c2f', name: 'F2Pool' },          // '/F2Pool/' in hex
    { pattern: '2f416e74506f6f6c2f', name: 'AntPool' },       // '/AntPool/' in hex
    { pattern: '2f42696e616e63652f', name: 'Binance Pool' },  // '/Binance/' in hex
  ];

  // Early return for invalid input cases
  if (!coinbaseData && !rawBlockData) {
    return 'Unknown Miner';
  }

  try {
    // APPROACH 1: Check coinbase script pattern if available
    if (coinbaseData && typeof coinbaseData === 'string') {
      const coinbaseDataLower = coinbaseData.toLowerCase();
      
      // Try to match known hex patterns
      for (const { pattern, name } of minerHexPatterns) {
        if (coinbaseDataLower.includes(pattern.toLowerCase())) {
          return name;
        }
      }
      
      // Create ASCII representation from hex
      let asciiHint = '';
      try {
        for (let i = 0; i < coinbaseDataLower.length; i += 2) {
          const hexByte = coinbaseDataLower.substr(i, 2);
          const charCode = parseInt(hexByte, 16);
          // Only include printable ASCII characters
          if (charCode >= 32 && charCode <= 126) {
            asciiHint += String.fromCharCode(charCode);
          }
        }
      } catch (e) {
        console.error('Error parsing coinbase ASCII:', e);
      }
      
      // Check the ASCII hint for known signatures
      if (asciiHint) {
        const asciiLower = asciiHint.toLowerCase();
        for (const [minerName, signatures] of Object.entries(minerSignatures)) {
          for (const signature of signatures) {
            if (asciiLower.includes(signature.toLowerCase())) {
              return minerName;
            }
          }
        }
      }
    }
    
    // APPROACH 2: Check block data for miner information if available
    if (rawBlockData && typeof rawBlockData === 'object' && 
        rawBlockData.tx && Array.isArray(rawBlockData.tx) && rawBlockData.tx.length > 0) {
      const coinbaseTx = rawBlockData.tx[0];
      
      // Check coinbase transaction output addresses
      if (coinbaseTx.out && Array.isArray(coinbaseTx.out) && coinbaseTx.out.length > 0) {
        for (const output of coinbaseTx.out) {
          if (output.addr && minerAddresses[output.addr]) {
            return minerAddresses[output.addr];
          }
        }
      }
    }
    
    // APPROACH 3: Check for generic pool indicators in coinbase data
    if (coinbaseData && typeof coinbaseData === 'string') {
      const coinbaseDataLower = coinbaseData.toLowerCase();
      if (coinbaseDataLower.includes('706f6f6c')) return 'Mining Pool'; // 'pool' in hex
    }
    
  } catch (error) {
    console.error('Error identifying miner:', error);
  }
  
  // Fallback to unknown if no matches found
  return 'Unknown Miner';
};

// formatTimeAgo
/**
 * Format a timestamp to a human-readable time ago format
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted time ago string
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(secondsAgo / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
};

/**
 * Calculate the difficulty from the bits field in the block header
 * @param {Object|string|number} blockData - The full block data object or bits value
 * @returns {number} The calculated difficulty
 */
export const calculateDifficulty = (blockData) => {
  try {
    // Handle invalid inputs
    if (blockData === null || blockData === undefined) {
      return 0;
    }
    
    // Extract the bits field from block data if an object is passed
    let bits;
    if (typeof blockData === 'object') {
      bits = blockData.bits || (blockData.prev_block ? blockData.bits : null);
      
      // If bits is still not found, try alternate locations in the API response
      if (!bits && typeof blockData === 'object') {
        // Different APIs use different field names for bits
        bits = blockData.bits || blockData.bits_hex || blockData.nBits;
      }
      
      // If we still can't find bits, return 0
      if (!bits) {
        console.error('Could not extract bits field from block data:', blockData);
        return 0;
      }
    } else {
      // If a primitive is passed, assume it's the bits value directly
      bits = blockData;
    }
    
    // Convert bits to hexadecimal string if it's not already
    let bitsHex;
    if (typeof bits === 'string') {
      bitsHex = bits.startsWith('0x') ? bits : '0x' + bits;
    } else if (typeof bits === 'number') {
      bitsHex = '0x' + bits.toString(16).padStart(8, '0');
    } else {
      return 0; // Invalid bits format
    }
    
    // Parse the bits value - Bitcoin "bits" field is a packed representation
    const bitsVal = parseInt(bitsHex, 16);
    if (isNaN(bitsVal)) {
      return 0; // Invalid bits format
    }

    // Bitcoin difficulty calculation according to the Bitcoin protocol
    
    // Extract exponent and mantissa from bits
    const exponent = bitsVal >> 24;
    const mantissa = bitsVal & 0x00FFFFFF;
    
    // Handle invalid values
    if (mantissa === 0 || exponent === 0) {
      return 0;
    }
    
    // Handle special case: genesis block
    if (bitsHex === '0x1d00ffff') {
      return 1.0;
    }
    
    try {
      // The highest target (lowest difficulty) in Bitcoin (difficulty 1)
      // is 0x00000000FFFF0000000000000000000000000000000000000000000000000000
      
      // Step 1: Calculate the target from the bits representation
      // In Bitcoin's compact representation: target = mantissa * 256^(exponent-3)
      let target;
      
      // Use BigInt for precise calculations with large numbers
      if (exponent <= 3) {
        // Shift right if exponent is small
        target = BigInt(mantissa) >> BigInt(8 * (3 - exponent));
      } else {
        // Shift left for normal case
        target = BigInt(mantissa) << BigInt(8 * (exponent - 3));
      }
      
      // The original maximum target (difficulty 1) used in Bitcoin
      // This is 0x00000000FFFF0000000000000000000000000000000000000000000000000000
      // Which can be represented as 0xFFFF << 208
      const maxTarget = BigInt(0xFFFF) << BigInt(208);
      
      // Step 2: Difficulty = maxTarget / current target
      // This follows the formula specified in Bitcoin's documentation
      if (target === BigInt(0)) {
        return 0; // Prevent division by zero
      }
      
      // Calculate difficulty as the ratio between maximum target and current target
      // This will be very large for recent Bitcoin blocks (in the trillions)
      const difficulty = Number(maxTarget / target);
      
      return difficulty;
    } catch (error) {
      console.error('Error in difficulty calculation:', error);
      return 0;
    }
  } catch (error) {
    console.error('Error calculating difficulty:', error);
    return 0;
  }
};
