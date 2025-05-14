describe('Block Details Page Tests', () => {
  const sampleBlockHash = '00000000000000000002bf1c218853bc920f41126f88843b1a89c8f904e31c5d';
  
  beforeEach(() => {
    // Mock API responses before visiting the page
    cy.mockBlockchainApi();
    cy.visit(`/block/${sampleBlockHash}`);
    // Wait for API requests to complete
    cy.wait('@getBlockDetails');
  });

  it('displays the block header information', () => {
    cy.findByRole('heading', { name: /block details/i }).should('be.visible');
    cy.findByText(`Block #${800000}`).should('be.visible');
    cy.findByText(sampleBlockHash).should('be.visible');
  });

  it('displays block metadata correctly', () => {
    cy.findByText(/time/i).should('be.visible');
    cy.findByText(/size/i).should('be.visible').next().should('contain', '1578494');
    cy.findByText(/transactions/i).should('be.visible').next().should('contain', '2104');
  });

  it('displays transaction list', () => {
    cy.findByTestId('transaction-list').should('be.visible');
    cy.findAllByTestId('transaction-item').should('have.length.at.least', 1);
    // Check first transaction hash is displayed
    cy.findByText('b0c5c624acef329a587b91de4adba9175934f1517827df92fa465d1dc23f9e6a')
      .should('be.visible');
  });

  it('allows navigation back to home page', () => {
    cy.findByRole('link', { name: /back to home/i }).click();
    cy.url().should('not.include', '/block/');
    cy.findByTestId('blocks-table').should('be.visible');
  });
});