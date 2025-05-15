import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Header from './Header';
import theme from '../styles/theme';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render with theme and router
const renderHeader = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <Header />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo and search elements correctly', () => {
    renderHeader();
    
    // Check if logo is rendered
    const logoImage = screen.getByAltText('Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/block-logo.png');
    
    // Check if logo text is rendered
    expect(screen.getByText('Dup Block Explorer')).toBeInTheDocument();
    
    // Check if search input is rendered
    const searchInput = screen.getByPlaceholderText('Search by block hash or height');
    expect(searchInput).toBeInTheDocument();
    
    // Check if search button is rendered
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('handles valid block hash search correctly', () => {
    renderHeader();
    
    // Type a valid block hash
    const validHash = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
    const searchInput = screen.getByPlaceholderText('Search by block hash or height');
    fireEvent.change(searchInput, { target: { value: validHash } });
    
    // Submit the search form
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    // Check if navigation was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith(`/btc/block/${validHash}`);
    
    // No error message should be displayed
    expect(screen.queryByText(/Please enter a valid block hash/)).not.toBeInTheDocument();
  });

  it('shows error message for empty search', () => {
    renderHeader();
    
    // Submit an empty search
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    // Check if error message is displayed
    expect(screen.getByText('Please enter a block hash or height')).toBeInTheDocument();
    
    // Navigation should not be called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows error message for invalid search format', () => {
    renderHeader();
    
    // Type an invalid input (too short for a hash, contains non-hex characters)
    const invalidInput = 'not-a-valid-hash-or-height!';
    const searchInput = screen.getByPlaceholderText('Search by block hash or height');
    fireEvent.change(searchInput, { target: { value: invalidInput } });
    
    // Submit the search form
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    // Check if error message is displayed
    expect(screen.getByText('Please enter a valid block hash (64 hex characters) or block height')).toBeInTheDocument();
    
    // Navigation should not be called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows appropriate message for block height search', () => {
    renderHeader();
    
    // Type a valid block height
    const blockHeight = '123456';
    const searchInput = screen.getByPlaceholderText('Search by block hash or height');
    fireEvent.change(searchInput, { target: { value: blockHeight } });
    
    // Submit the search form
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    // Check if the appropriate message is displayed (since block height search is not implemented yet)
    expect(screen.getByText('Block height search will be implemented soon')).toBeInTheDocument();
    
    // Navigation should not be called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('clears error message when search input changes', () => {
    renderHeader();
    
    // Submit an empty search to trigger error
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    // Error should be displayed
    expect(screen.getByText('Please enter a block hash or height')).toBeInTheDocument();
    
    // Now type something in the input
    const searchInput = screen.getByPlaceholderText('Search by block hash or height');
    fireEvent.change(searchInput, { target: { value: 'a' } });
    
    // Submit again with invalid input
    fireEvent.click(searchButton);
    
    // Error message should be updated (not showing the empty search error anymore)
    expect(screen.queryByText('Please enter a block hash or height')).not.toBeInTheDocument();
    expect(screen.getByText('Please enter a valid block hash (64 hex characters) or block height')).toBeInTheDocument();
  });

  it('has a working logo link that navigates to homepage', () => {
    renderHeader();
    
    // Find the logo link
    const logoLink = screen.getByText('Dup Block Explorer').closest('a');
    
    // Check that it has the correct href
    expect(logoLink).toHaveAttribute('href', '/');
  });
});