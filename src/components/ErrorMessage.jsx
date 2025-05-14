import React from 'react';
import styled from 'styled-components';
import { getUserFriendlyMessage } from '../services/api/errorHandlingService';

/**
 * Component for displaying user-friendly error messages
 * @param {Object} props
 * @param {Object} props.error - The error object
 * @param {String} props.message - Optional override message
 * @param {Function} props.onRetry - Optional retry function
 */
const ErrorMessage = ({ error, message, onRetry }) => {
  // Determine which message to show
  const displayMessage = message || (error && getUserFriendlyMessage(error)) || 'An error occurred';
  
  // Check if this is a CORS error
  const isCorsError = error?.type === 'CORS_ERROR';

  return (
    <ErrorContainer data-testid="error-message-container">
      <ErrorIcon aria-hidden="true">!</ErrorIcon>
      <ErrorContent>
        <ErrorTitle>Error</ErrorTitle>
        <ErrorText data-testid="error-message-text">{displayMessage}</ErrorText>
        
        {/* Special instructions for CORS errors */}
        {isCorsError && (
          <CorsTip>
            <p>This application requires CORS to be enabled to access the blockchain API.</p>
            <a 
              href="https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Install the Allow CORS extension
            </a>
            <p>After installing, enable the extension and refresh this page.</p>
          </CorsTip>
        )}

        {/* Only show retry button if a retry function is provided */}
        {onRetry && (
          <RetryButton onClick={onRetry}>
            Try Again
          </RetryButton>
        )}
      </ErrorContent>
    </ErrorContainer>
  );
};

// Styled components
const ErrorContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background-color: #fff1f0;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin: 1rem 0;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ErrorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 50%;
  font-weight: bold;
  margin-right: 1rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    margin-right: 0;
  }
`;

const ErrorContent = styled.div`
  flex: 1;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.error};
`;

const ErrorText = styled.p`
  margin: 0 0 1rem 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const RetryButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  font-weight: 600;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const CorsTip = styled.div`
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
  padding: 0.75rem;
  margin: 0.5rem 0 1rem;
  font-size: 0.9rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  p {
    margin: 0.5rem 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    display: block;
    margin: 0.5rem 0;
    font-weight: 600;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
`;

export default ErrorMessage;