describe('Stock Search Feature', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('displays the search form', () => {
    // Check if search form elements are present
    cy.get('[data-testid="search-form"]').should('exist');
    cy.checkForVisualIssues('[data-testid="search-form"]');
    
    cy.get('[data-testid="search-input"]').should('exist');
    cy.checkForVisualIssues('[data-testid="search-input"]');
    
    cy.get('[data-testid="search-button"]').should('exist');
    cy.checkForVisualIssues('[data-testid="search-button"]');
  });

  it('allows users to search for stocks', () => {
    // Type in the search box
    cy.get('[data-testid="search-input"]').type('RELIANCE');
    
    // Click the search button
    cy.get('[data-testid="search-button"]').click();
    
    // Verify search results appear
    cy.get('[data-testid="search-results"]').should('be.visible');
    cy.get('[data-testid="stock-card"]').should('have.length.at.least', 1);
    
    // Check if the searched stock appears in results
    cy.contains('Reliance Industries Ltd.').should('be.visible');
  });

  it('handles no search results gracefully', () => {
    // Type a search term unlikely to match anything
    cy.get('[data-testid="search-input"]').type('NONEXISTENTSTOCK123456');
    
    // Click the search button
    cy.get('[data-testid="search-button"]').click();
    
    // Verify empty state message appears
    cy.get('[data-testid="no-results"]').should('be.visible');
    cy.contains('No stocks found matching your search').should('be.visible');
  });

  it('navigates to stock details page when clicking on a stock', () => {
    // Search for a stock
    cy.get('[data-testid="search-input"]').type('RELIANCE');
    cy.get('[data-testid="search-button"]').click();
    
    // Wait for results and click on the first stock
    cy.get('[data-testid="stock-card"]').first().click();
    
    // Verify navigation to details page
    cy.url().should('include', '/stocks/');
    cy.get('[data-testid="stock-details"]').should('be.visible');
    cy.contains('Reliance Industries Ltd.').should('be.visible');
  });
}); 