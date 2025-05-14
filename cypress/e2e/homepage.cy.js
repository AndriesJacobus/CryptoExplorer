describe('Homepage Tests', () => {
  beforeEach(() => {
    // Mock API responses before visiting the page
    cy.mockBlockchainApi();
    cy.visit('/');
    // Wait for API requests to complete
    cy.wait('@getBlocks');
  });

  it('displays the header with correct title', () => {
    cy.findByRole('heading', { name: /blockchain explorer/i }).should('be.visible');
  });

  it('displays a list of blocks', () => {
    cy.findByTestId('blocks-table').should('be.visible');
    cy.findAllByTestId('block-row').should('have.length.at.least', 1);
  });

  it('allows navigation to block details page', () => {
    // Get the first block hash and click on it
    cy.findAllByTestId('block-row').first().click();
    
    // Check that we navigated to the block details page
    cy.url().should('include', '/block/');
    cy.findByRole('heading', { name: /block details/i }).should('be.visible');
  });
});