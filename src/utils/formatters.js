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
 * Identify miner name from coinbase data or address
 * @param {string} coinbaseData - The coinbase data from the block
 * @param {string} address - The miner's address
 * @returns {string} Miner name if identified, or "Unknown Miner"
 */
export const identifyMiner = (coinbaseData, address) => {
  // This is a simplified version
  // In a real implementation, you would have a more comprehensive
  // database of mining pool signatures
  const minerSignatures = {
    '/Foundry/': 'Foundry USA',
    '/F2Pool/': 'F2Pool',
    '/AntPool/': 'AntPool',
    '/Binance/': 'Binance Pool',
    '/ViaBTC/': 'ViaBTC',
    '/SlushPool/': 'SlushPool',
    '/Poolin/': 'Poolin',
  };

  if (!coinbaseData) return 'Unknown Miner';

  // Try to identify from coinbase data
  const decodedCoinbase = Buffer.from(coinbaseData, 'hex').toString('utf8');
  
  for (const [signature, name] of Object.entries(minerSignatures)) {
    if (decodedCoinbase.includes(signature.replace(/\//g, ''))) {
      return name;
    }
  }
  
  // Fallback to address-based identification or return unknown
  return 'Unknown Miner';
};
