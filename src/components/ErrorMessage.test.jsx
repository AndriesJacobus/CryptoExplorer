import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from 'styled-components';
import ErrorMessage from './ErrorMessage';
import theme from '../styles/theme';
import { getUserFriendlyMessage } from '../services/api/errorHandlingService';

// Mock the errorHandlingService
vi.mock('../services/api/errorHandlingService', () => ({
  getUserFriendlyMessage: vi.fn((error) => {
    if (error?.message) {
      return `Friendly: ${error.message}`;
    }
    return 'Unknown error occurred';
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

  it('renders with the provided error message', () => {
    const errorObj = { message: 'API request failed' };
    renderWithTheme(<ErrorMessage error={errorObj} />);
    
    // Check that the error message is displayed
    expect(screen.getByTestId('error-message-text')).toHaveTextContent('Friendly: API request failed');
    
    // Check that getUserFriendlyMessage was called with the error object
    expect(getUserFriendlyMessage).toHaveBeenCalledWith(errorObj);
  });

  it('uses custom message when provided', () => {
    const errorObj = { message: 'API request failed' };
    const customMessage = 'Custom error message';
    renderWithTheme(<ErrorMessage error={errorObj} message={customMessage} />);
    
    // Check that the custom message is displayed instead of the error message
    expect(screen.getByTestId('error-message-text')).toHaveTextContent(customMessage);
    
    // getUserFriendlyMessage should not be called when a custom message is provided
    expect(getUserFriendlyMessage).not.toHaveBeenCalled();
  });

  it('displays default message when no error or message is provided', () => {
    renderWithTheme(<ErrorMessage />);
    
    // Check that the default error message is displayed
    expect(screen.getByTestId('error-message-text')).toHaveTextContent('An error occurred');
  });

  it('renders a retry button when onRetry function is provided', () => {
    const onRetry = vi.fn();
    renderWithTheme(<ErrorMessage onRetry={onRetry} />);
    
    // Check that the retry button is rendered
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    // Click the retry button
    fireEvent.click(retryButton);
    
    // Check that the onRetry function was called
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render a retry button when no onRetry function is provided', () => {
    renderWithTheme(<ErrorMessage />);
    
    // Check that the retry button is not rendered
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('renders special instructions for CORS errors', () => {
    const corsError = { type: 'CORS_ERROR', message: 'CORS error' };
    renderWithTheme(<ErrorMessage error={corsError} />);
    
    // Check that CORS-specific instructions are displayed
    expect(screen.getByText('This application requires CORS to be enabled to access the blockchain API.')).toBeInTheDocument();
    
    // Check that the link to install the CORS extension is present
    const corsLink = screen.getByText('Install the Allow CORS extension');
    expect(corsLink).toBeInTheDocument();
    expect(corsLink).toHaveAttribute('href', expect.stringContaining('chrome.google.com/webstore'));
    expect(corsLink).toHaveAttribute('target', '_blank');
    
    // Check that the refresh instructions are present
    expect(screen.getByText('After installing, enable the extension and refresh this page.')).toBeInTheDocument();
  });

  it('does not render CORS instructions for non-CORS errors', () => {
    const nonCorsError = { type: 'API_ERROR', message: 'API error' };
    renderWithTheme(<ErrorMessage error={nonCorsError} />);
    
    // Check that CORS-specific instructions are not displayed
    expect(screen.queryByText('This application requires CORS to be enabled to access the blockchain API.')).not.toBeInTheDocument();
    expect(screen.queryByText('Install the Allow CORS extension')).not.toBeInTheDocument();
  });

  it('renders with the correct styling', () => {
    renderWithTheme(<ErrorMessage />);
    
    // Check that the error container has the correct styling
    const errorContainer = screen.getByTestId('error-message-container');
    expect(errorContainer).toHaveStyle('background-color: #fff1f0');
    expect(errorContainer).toHaveStyle(`border: 1px solid ${theme.colors.error}`);
    
    // Check that the error icon is rendered with the correct styling
    const errorIcon = screen.getByText('!');
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveStyle(`background-color: ${theme.colors.error}`);
    expect(errorIcon).toHaveStyle('color: rgb(255, 255, 255)');
    
    // Check that the error title is rendered with the correct styling
    const errorTitle = screen.getByText('Error');
    expect(errorTitle).toBeInTheDocument();
    expect(errorTitle).toHaveStyle(`color: ${theme.colors.error}`);
  });
});