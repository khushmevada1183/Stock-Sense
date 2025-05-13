// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to log errors found during testing
Cypress.Commands.add('logBug', (bugType, description, severity = 'medium', location) => {
  const bug = {
    type: bugType,
    description,
    severity,
    location,
    url: Cypress.config().baseUrl + Cypress.currentTest.url,
    timestamp: new Date().toISOString(),
    testName: Cypress.currentTest.title
  };
  
  // Log to console
  console.log('BUG FOUND:', bug);
  
  // You could also send this to an API or write to a file
  cy.task('logBug', bug, { log: false });
  
  // Continue test execution
  return cy.wrap(bug);
});

// Example command to check for visual issues
Cypress.Commands.add('checkForVisualIssues', (selector) => {
  cy.get(selector).then($el => {
    // Check if element is visible
    if (!$el.is(':visible')) {
      cy.logBug('visibility', `Element ${selector} is not visible`, 'high', Cypress.currentTest.title);
    }
    
    // Check if element has zero width or height
    const rect = $el[0].getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      cy.logBug('layout', `Element ${selector} has zero dimension`, 'high', Cypress.currentTest.title);
    }
    
    // Check if element is off-screen
    if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
      cy.logBug('layout', `Element ${selector} is off-screen`, 'medium', Cypress.currentTest.title);
    }
  });
});

// Example: command to check API response for errors
Cypress.Commands.add('checkApiErrors', (response) => {
  if (response.status >= 400) {
    cy.logBug('api', `API returned error status ${response.status}`, 'high', `${response.requestHeaders.Referer}`);
  }
  return cy.wrap(response);
}); 