import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import styled from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const BlockDetailPage = lazy(() => import('./pages/BlockDetailPage'));

// Loading fallback component
const LoadingFallback = () => (
  <LoadingContainer>
    <LoadingSpinner />
    <LoadingText>Loading...</LoadingText>
  </LoadingContainer>
);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 minutes cache as mentioned in the implementation plan
      retry: 2,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Router>
            <AppContainer>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <HomePage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                  <Route path="/btc/block/:blockHash" element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <BlockDetailPage />
                      </Suspense>
                    </ErrorBoundary>
                  } />
                </Route>
              </Routes>
            </AppContainer>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const AppContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: ${({ theme }) => theme.colors.primary};
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

export default App;
