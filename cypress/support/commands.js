// Import Testing Library commands
import '@testing-library/cypress/add-commands';

// Custom commands can be added here
Cypress.Commands.add('navigateToBlockDetails', (blockHash) => {
  cy.visit(`/block/${blockHash}`);
});

Cypress.Commands.add('mockBlockchainApi', () => {
  cy.intercept('GET', 'https://blockchain.info/blocks/*', { 
    fixture: 'blocks.json' 
  }).as('getBlocks');
  
  cy.intercept('GET', 'https://blockchain.info/rawblock/*', { 
    fixture: 'block-details.json' 
  }).as('getBlockDetails');
});