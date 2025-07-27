const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Stock Analyzer Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('cypress-mochawesome-reporter/plugin')(on);
      
      // Create a task for logging bugs
      on('task', {
        logBug(bug) {
          const bugsDir = path.join(__dirname, 'cypress', 'bugs');
          
          // Create bugs directory if it doesn't exist
          if (!fs.existsSync(bugsDir)) {
            fs.mkdirSync(bugsDir, { recursive: true });
          }
          
          // Create or append to bugs log file
          const bugsLogPath = path.join(bugsDir, 'bugs-log.json');
          let bugs = [];
          
          if (fs.existsSync(bugsLogPath)) {
            try {
              bugs = JSON.parse(fs.readFileSync(bugsLogPath, 'utf8'));
            } catch (e) {
              console.error('Error reading bugs log:', e);
            }
          }
          
          bugs.push(bug);
          fs.writeFileSync(bugsLogPath, JSON.stringify(bugs, null, 2));
          
          // Log to console
          console.log(`Bug logged: ${bug.type} - ${bug.description}`);
          
          // Return null to satisfy Cypress task requirement
          return null;
        }
      });
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
}); 