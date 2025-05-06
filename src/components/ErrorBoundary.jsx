import React, { Component } from 'react';
import styled from 'styled-components';

/**
 * ErrorBoundary component that catches JavaScript errors in child component tree
 * Prevents the entire app from crashing when a single component fails
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // In a production app, you would send this to your error tracking service
    // Example: Sentry.captureException(error);
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback;
      }
      
      return (
        <ErrorContainer>
          <ErrorIcon>!</ErrorIcon>
          <ErrorContent>
            <ErrorTitle>Something went wrong</ErrorTitle>
            <ErrorMessage>
              {error?.toString() || 'An unexpected error occurred'}
            </ErrorMessage>
            <RetryButton onClick={() => window.location.reload()}>
              Reload Page
            </RetryButton>
          </ErrorContent>
        </ErrorContainer>
      );
    }

    return children;
  }
}

// Styled components for the default error UI
const ErrorContainer = styled.div`
  display: flex;
  background-color: #fff8f8;
  border: 1px solid #ffb8b8;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  max-width: 100%;
`;

const ErrorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #ff4d4f;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  font-size: 1.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const ErrorContent = styled.div`
  flex: 1;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: #cf1322;
`;

const ErrorMessage = styled.p`
  margin: 0 0 1rem 0;
  white-space: pre-wrap;
`;

const RetryButton = styled.button`
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #40a9ff;
  }
`;

export default ErrorBoundary;