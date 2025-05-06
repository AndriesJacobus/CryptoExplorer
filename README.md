# Bitcoin Blockchain Explorer

A modern, responsive web application for exploring the Bitcoin blockchain. This application allows users to view the latest blocks, search for specific blocks by hash, and explore detailed transaction information within each block.

![Bitcoin Blockchain Explorer](https://blockchain.info/favicon.ico)

## Features

- **Home Page**:
  - Latest Bitcoin blocks with key information (height, hash, timestamp, miner, transaction count, size)
  - Real-time cryptocurrency price information (Bitcoin, Ethereum, Bitcoin Cash)
  - Responsive layout that works on all device sizes
  - Load more blocks functionality for extended browsing

- **Block Detail Page**:
  - Comprehensive information about each block including:
    - Hash, height, timestamp, and confirmations
    - Miner information with mining pool identification
    - Technical details (merkle root, difficulty, version, bits, nonce)
    - Size statistics (weight, size in bytes)
    - Economic details (transaction volume, block reward, fee reward)
  - Block navigation to previous/next blocks
  - Complete list of transactions in the block

- **Transaction View**:
  - Detailed transaction information with collapsible view
  - Input and output addresses with amounts
  - Transaction fee information
  - Visual indicators for transaction status
  - Technical details (size, weight, time)

## Technical Implementation

### Architecture

This project follows a modern React architecture with the following key components:

- **Framework**: React 18+ with Vite for optimal development experience
- **Styling**: Styled-components for component-based CSS
- **Routing**: React Router for navigation
- **State Management**: 
  - React Query for server state (API data)
  - React's built-in hooks (useState, useContext) for UI state
  - URL parameters as a source of truth for current view
- **API Communication**: Axios with custom error handling

### Project Structure

```
src/
├── components/    # Reusable UI components
│   ├── BlockCard.jsx
│   ├── BlockIcon.jsx
│   ├── CryptoPriceCard.jsx
│   ├── ErrorBoundary.jsx
│   ├── ErrorMessage.jsx
│   ├── Header.jsx
│   ├── Layout.jsx
│   ├── TransactionItem.jsx
│   └── TransactionList.jsx
├── pages/         # Page components
│   ├── BlockDetailPage.jsx
│   └── HomePage.jsx
├── services/      # API services
│   └── api/
│       ├── blockchainService.js
│       ├── cryptoService.js
│       └── errorHandlingService.js
├── styles/        # Global styles
│   ├── GlobalStyles.js
│   └── theme.js
├── utils/         # Helper functions
│   └── formatters.js
├── App.jsx        # Main application component
└── main.jsx       # Entry point
```

### Performance Optimizations

The application incorporates advanced performance optimization techniques to ensure smooth user experience even when dealing with large blockchain datasets:

#### 1. Code Splitting and Lazy Loading

Code splitting reduces the initial bundle size by dividing the application into smaller chunks that are loaded on demand:

```jsx
// App.jsx - Code splitting implementation
const HomePage = lazy(() => import('./pages/HomePage'));
const BlockDetailPage = lazy(() => import('./pages/BlockDetailPage'));

function App() {
  return (
    <ErrorBoundary>
      {/* ... */}
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <HomePage />
        </Suspense>
      } />
      {/* ... */}
    </ErrorBoundary>
  );
}
```

**Benefits implemented:**
- **Reduced Initial Load Time**: The initial JavaScript payload is significantly smaller, improving time-to-interactive
- **Route-Based Splitting**: Components are loaded only when their route is accessed
- **Dynamic Imports**: Using `React.lazy()` with dynamic `import()` statements for component-level code splitting
- **Graceful Loading States**: Custom loading indicators with `Suspense` provide visual feedback during chunk loading
- **Predictive Prefetching**: Critical routes are prefetched during idle time for faster subsequent navigation

#### 2. Efficient Rendering

Multiple strategies are employed to minimize unnecessary renders and optimize component performance:

```jsx
// Optimized component with memo and useMemo
const TransactionList = memo(({ blockHash, transactionHashes, initialCount = 10 }) => {
  // Component state...
  
  // Memoized derived data
  const displayedHashes = useMemo(() => 
    transactionHashes?.slice(0, visibleCount) || [],
    [transactionHashes, visibleCount]
  );
  
  // Memoized expensive calculations
  const { hasMore, transactionCount } = useMemo(() => ({
    hasMore: transactionHashes && visibleCount < transactionHashes.length,
    transactionCount: transactionHashes?.length || 0
  }), [transactionHashes, visibleCount]);
  
  // Memoized callback
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + 10);
  }, []);
  
  // Component render...
});
```

**Specific techniques implemented:**
- **Selective Rendering with React.memo()**: Prevents re-renders when props haven't changed for computation-heavy components like `BlockCard` and `TransactionList`
- **Optimized Calculations with useMemo()**: Complex calculations and data transformations (like fee calculations and transaction aggregations) are memoized with proper dependency arrays
- **Stable Event Handlers with useCallback()**: Event handlers that are passed as props are stabilized to prevent unnecessary child component re-renders
- **Component Virtualization Strategy**: For transaction lists, we implemented incremental loading with "load more" functionality rather than rendering all transactions at once
- **Conditional Rendering Logic**: Components use early returns and conditional rendering to avoid unnecessary DOM operations
- **PureComponent Patterns**: Following immutable data patterns to ensure proper shallow comparison works effectively

#### 3. Data Management

The application uses React Query for efficient data fetching, caching, and state management:

```jsx
// Example of optimized data fetching with React Query
const { 
  data: block, 
  isLoading, 
  error,
  refetch 
} = useQuery({
  queryKey: ['block', blockHash],
  queryFn: () => blockchainService.getBlockByHash(blockHash),
  enabled: !!blockHash,
  retry: 1,
  staleTime: 600000, // 10 minutes cache
});
```

**Advanced data management strategies:**
- **Optimized Caching Strategy**: 
  - Block data is cached for 10 minutes to reduce redundant API calls
  - Transaction data uses a 5-minute cache to balance freshness with performance
  - Cryptocurrency prices refresh every 5 minutes to provide timely market data
- **Intelligent Data Fetching**:
  - Conditional fetching prevents unnecessary API calls when dependencies are missing
  - Batching related requests to minimize network overhead
  - Request deduplication to prevent duplicate API calls for the same data
- **Background Data Updates**: 
  - Implements stale-while-revalidate pattern to show cached data immediately while updating in background
  - Only retries failed requests a limited number of times to prevent API abuse
- **Prefetching Critical Data**: 
  - When viewing a block, the application prefetches adjacent blocks for faster navigation
  - Implements intelligent transaction batch loading based on user scroll patterns
- **Fallback Mechanisms**:
  - Graceful degradation with fallback data when APIs are unavailable
  - Implements error boundaries and recovery strategies at multiple levels

#### 4. Error Handling

- React Error Boundaries for graceful error recovery
- Global and component-level error handling
- Fallback UI for various error states

### Mobile Responsiveness

The application is fully responsive across all device sizes with special attention to:

- Adaptive layouts using CSS Grid and Flexbox
- Mobile-optimized component designs
- Touch-friendly interaction targets
- Progressive disclosure of information on smaller screens

## API Integration

This project integrates with the Blockchain.com API:

- Latest blocks: `https://api.blockchain.info/haskoin-store/btc/block/heights`
- Block details: `https://api.blockchain.info/haskoin-store/btc/block`
- Transaction details: `https://api.blockchain.info/haskoin-store/btc/transactions`

**Note**: Due to CORS restrictions, the application requires a CORS extension when running in development mode. For production deployment, a proper backend proxy would be implemented.

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- [CORS Unblock Extension](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino) for Chrome (development only)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bitcoin-blockchain-explorer.git
   cd bitcoin-blockchain-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Build for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` folder.

## Roadmap & Future Improvements

Future enhancements could include:

- **Extended Search** - Ability to search by block height, transaction ID, or address
- **Address View** - Detailed information about Bitcoin addresses and their transaction history
- **Data Visualizations** - Charts and graphs for blockchain statistics
- **Transaction Graphing** - Visual representation of transaction relationships
- **Price History** - Historical price data with interactive charts

## Technologies Used

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [React Query](https://tanstack.com/query/latest)
- [Axios](https://axios-http.com/)
- [Styled Components](https://styled-components.com/)

## Acknowledgments

- [Blockchain.com](https://blockchain.com) for providing the API
- [CoinGecko](https://coingecko.com) for cryptocurrency price data
- [Bitcoin.org](https://bitcoin.org) for technical information

---

Made with 💚 by [AndriesJacobus](https://github.com/AndriesJacobus/)