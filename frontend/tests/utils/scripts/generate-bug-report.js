/**
 * Bug Report Generator
 * Generates a summary HTML report from the Cypress bugs log
 */

const fs = require('fs');
const path = require('path');

// Paths
const bugsLogPath = path.join(__dirname, '..', 'cypress', 'bugs', 'bugs-log.json');
const reportPath = path.join(__dirname, '..', 'cypress', 'bugs', 'bug-report.html');

// Check if bugs log exists
if (!fs.existsSync(bugsLogPath)) {
  console.error('No bugs log found. Run Cypress tests first.');
  process.exit(1);
}

// Read bugs log
const bugs = JSON.parse(fs.readFileSync(bugsLogPath, 'utf8'));

// Group bugs by type and severity
const bugsByType = {};
const bugsBySeverity = {
  high: [],
  medium: [],
  low: []
};
const bugsByLocation = {};

bugs.forEach(bug => {
  // Group by type
  if (!bugsByType[bug.type]) {
    bugsByType[bug.type] = [];
  }
  bugsByType[bug.type].push(bug);
  
  // Group by severity
  bugsBySeverity[bug.severity].push(bug);
  
  // Group by location
  if (!bugsByLocation[bug.location]) {
    bugsByLocation[bug.location] = [];
  }
  bugsByLocation[bug.location].push(bug);
});

// Generate HTML report
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock Analyzer - Bug Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .summary-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      width: 30%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .bug-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .bug-table th, .bug-table td {
      border: 1px solid #ddd;
      padding: 12px;
    }
    .bug-table th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: left;
    }
    .bug-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .high { color: #e74c3c; }
    .medium { color: #f39c12; }
    .low { color: #3498db; }
  </style>
</head>
<body>
  <h1>Stock Analyzer - Bug Report</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Total Bugs: ${bugs.length}</h3>
      <p>High: <span class="high">${bugsBySeverity.high.length}</span></p>
      <p>Medium: <span class="medium">${bugsBySeverity.medium.length}</span></p>
      <p>Low: <span class="low">${bugsBySeverity.low.length}</span></p>
    </div>
    <div class="summary-card">
      <h3>By Type</h3>
      ${Object.entries(bugsByType).map(([type, bugs]) => 
        `<p>${type}: ${bugs.length}</p>`
      ).join('')}
    </div>
    <div class="summary-card">
      <h3>Most Affected Areas</h3>
      ${Object.entries(bugsByLocation)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5)
        .map(([location, bugs]) => 
          `<p>${location}: ${bugs.length}</p>`
        ).join('')}
    </div>
  </div>
  
  <h2>High Severity Bugs</h2>
  <table class="bug-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Description</th>
        <th>Location</th>
        <th>Test</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      ${bugsBySeverity.high.map(bug => `
        <tr>
          <td>${bug.type}</td>
          <td>${bug.description}</td>
          <td>${bug.location}</td>
          <td>${bug.testName}</td>
          <td>${new Date(bug.timestamp).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>Medium Severity Bugs</h2>
  <table class="bug-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Description</th>
        <th>Location</th>
        <th>Test</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      ${bugsBySeverity.medium.map(bug => `
        <tr>
          <td>${bug.type}</td>
          <td>${bug.description}</td>
          <td>${bug.location}</td>
          <td>${bug.testName}</td>
          <td>${new Date(bug.timestamp).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>Low Severity Bugs</h2>
  <table class="bug-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Description</th>
        <th>Location</th>
        <th>Test</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      ${bugsBySeverity.low.map(bug => `
        <tr>
          <td>${bug.type}</td>
          <td>${bug.description}</td>
          <td>${bug.location}</td>
          <td>${bug.testName}</td>
          <td>${new Date(bug.timestamp).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
`;

// Write report to file
fs.writeFileSync(reportPath, html);

console.log(`Bug report generated at: ${reportPath}`); 