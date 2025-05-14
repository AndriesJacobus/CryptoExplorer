import React from 'react';
import { describe, expect, vi, beforeEach, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';
import ErrorMessage from './ErrorMessage';
import * as errorHandlingService from '../services/api/errorHandlingService';

// Mock the error handling service
vi.mock('../services/api/errorHandlingService', () => ({
  getUserFriendlyMessage: vi.fn((error) => {
    if (error?.type === 'NETWORK_ERROR') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error?.type === 'NOT_FOUND') {
      return 'The requested resource was not found.';
    }
    return 'An unexpected error occurred.';
  })
}));

// Helper function to render with theme
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>
  );
};

describe('ErrorMessage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('renders default error message when no error or message provided', () => {
    renderWithTheme(<ErrorMessage />);
    
    // Check that the component renders with the default message
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });
  
  test('displays custom message when provided', () => {
    const customMessage = 'This is a custom error message';
    renderWithTheme(<ErrorMessage message={customMessage} />);
    
    // Custom message should take precedence
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    
    // getUserFriendlyMessage should not be called when a custom message is provided
    expect(errorHandlingService.getUserFriendlyMessage).not.toHaveBeenCalled();
  });
  
  test('gets user-friendly message from error handling service', () => {
    const mockError = { type: 'NETWORK_ERROR', message: 'Network error' };
    renderWithTheme(<ErrorMessage error={mockError} />);
    
    // Service should be called with the error
    expect(errorHandlingService.getUserFriendlyMessage).toHaveBeenCalledWith(mockError);
    
    // Friendly message from service should be displayed
    expect(screen.getByText('Unable to connect to the server. Please check your internet connection.')).toBeInTheDocument();
  });
  
  test('displays try again button when onRetry prop is provided', () => {
    const mockRetry = vi.fn();
    renderWithTheme(<ErrorMessage onRetry={mockRetry} />);
    
    // Button should be visible
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    // Button should call the retry function when clicked
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
  
  test('does not display retry button when onRetry is not provided', () => {
    renderWithTheme(<ErrorMessage />);
    
    // Button should not be visible
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
  
  test('displays CORS-specific instructions for CORS errors', () => {
    const corsError = { type: 'CORS_ERROR', message: 'CORS error' };
    renderWithTheme(<ErrorMessage error={corsError} />);
    
    // Should display CORS-specific help text
    expect(screen.getByText('This application requires CORS to be enabled to access the blockchain API.')).toBeInTheDocument();
    expect(screen.getByText('Install the Allow CORS extension')).toBeInTheDocument();
    expect(screen.getByText('After installing, enable the extension and refresh this page.')).toBeInTheDocument();
  });
  
  test('does not display CORS instructions for non-CORS errors', () => {
    const nonCorsError = { type: 'NETWORK_ERROR', message: 'Network error' };
    renderWithTheme(<ErrorMessage error={nonCorsError} />);
    
    // Should not display CORS-specific help text
    expect(screen.queryByText('This application requires CORS to be enabled to access the blockchain API.')).not.toBeInTheDocument();
    expect(screen.queryByText('Install the Allow CORS extension')).not.toBeInTheDocument();
  });
  
  test('renders with the correct styling', () => {
    const { container } = renderWithTheme(<ErrorMessage />);
    
    // Check error container has error styling
    const errorContainer = screen.getByTestId('error-message-container');
    expect(errorContainer).toHaveStyle('background-color: #fff1f0');
    
    // Error icon should be present
    const errorIcon = container.querySelector('div[aria-hidden="true"]');
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveTextContent('!');
  });
  
  test('handles errors with undefined properties gracefully', () => {
    // Error with undefined properties
    const incompleteError = { };
    renderWithTheme(<ErrorMessage error={incompleteError} />);
    
    // Should still render without crashing
    expect(screen.getByTestId('error-message-container')).toBeInTheDocument();
    expect(errorHandlingService.getUserFriendlyMessage).toHaveBeenCalledWith(incompleteError);
  });
});