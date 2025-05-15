import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Layout from './Layout';
import theme from '../styles/theme';

// Mock the Header component
vi.mock('./Header', () => ({
  default: () => <div data-testid="mock-header">Mock Header</div>
}));

// Mock the Outlet from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">Mock Outlet Content</div>
  };
});

// Helper function to render with theme and router
const renderLayout = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <Layout />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Layout Component', () => {
  it('renders the header component', () => {
    renderLayout();
    
    // Check if header is rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
  });

  it('renders the outlet for child routes', () => {
    renderLayout();
    
    // Check if outlet is rendered
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    expect(screen.getByText('Mock Outlet Content')).toBeInTheDocument();
  });

  it('has appropriate container styling', () => {
    const { container } = renderLayout();
    
    // The first element should be the LayoutContainer
    const layoutContainer = container.firstChild;
    
    // Check that the main layout styles are applied
    expect(layoutContainer).toHaveStyle('display: flex');
    expect(layoutContainer).toHaveStyle('flex-direction: column');
    expect(layoutContainer).toHaveStyle('min-height: 100vh');
    expect(layoutContainer).toHaveStyle('width: 100vw');
    expect(layoutContainer).toHaveStyle('max-width: 100%');
    expect(layoutContainer).toHaveStyle('overflow-x: hidden');
  });

  it('has properly styled main content area', () => {
    const { container } = renderLayout();
    
    // Find the main content area - it's a main element
    const mainContent = container.querySelector('main');
    expect(mainContent).toBeInTheDocument();
    
    // Check that the main content styles are applied
    expect(mainContent).toHaveStyle('flex-grow: 1');
    expect(mainContent).toHaveStyle('width: 100vw');
    expect(mainContent).toHaveStyle('max-width: 100%');
    expect(mainContent).toHaveStyle('padding: 0');
    expect(mainContent).toHaveStyle('box-sizing: border-box');
  });

  it('has the correct DOM structure', () => {
    const { container } = renderLayout();
    
    // Check the DOM structure - Header followed by main content
    const layoutContainer = container.firstChild;
    
    // Should have 2 children - header and main
    expect(layoutContainer.children.length).toBe(2);
    expect(layoutContainer.children[0]).toHaveTextContent('Mock Header');
    
    // Check that the second child is the main element
    expect(layoutContainer.children[1].tagName.toLowerCase()).toBe('main');
  });
});