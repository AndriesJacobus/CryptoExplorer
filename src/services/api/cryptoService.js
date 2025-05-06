import axios from 'axios';
import { categorizeError, logError } from './errorHandlingService';

// Create an axios instance for cryptocurrency API calls
const api = axios.create({
  timeout: 10000, // 10 seconds
});

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const categorizedError = categorizeError(error);
    logError(categorizedError);
    return Promise.reject(categorizedError);
  }
);

// CoinGecko API endpoint for fetching cryptocurrency data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * Fetch data for specified cryptocurrencies
 * @param {Array<string>} coinIds - Array of coin IDs to fetch (e.g., ['bitcoin', 'ethereum'])
 * @returns {Promise} - Promise resolving to cryptocurrency data
 */
export const getCryptoPrices = async (coinIds = ['bitcoin', 'ethereum', 'bitcoin-cash']) => {
  try {
    const response = await api.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: coinIds.join(','),
        order: 'market_cap_desc',
        per_page: coinIds.length,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
        locale: 'en'
      }
    });

    // Transform API response to match our application's data structure
    return response.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      logo: coin.image,
    }));
  } catch {
    // If CoinGecko API fails, return mock data
    console.warn('Failed to fetch crypto data, using fallback data');
    return getFallbackCryptoData();
  }
};

/**
 * Provide fallback data when API is unavailable
 * This ensures the UI can still render even if the API is down
 */
const getFallbackCryptoData = () => {
  return [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 65432.10,
      change24h: 2.34,
      marketCap: 1268000000000,
      logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      price: 3521.75,
      change24h: -1.45,
      marketCap: 423000000000,
      logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    },
    {
      id: 'bitcoin-cash',
      name: 'Bitcoin Cash',
      symbol: 'BCH',
      price: 423.89,
      change24h: 0.72,
      marketCap: 8300000000,
      logo: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
    },
  ];
};

export default {
  getCryptoPrices,
};