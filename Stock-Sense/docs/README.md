# Indian Stock Analyzer Frontend

A Next.js application for analyzing Indian stocks with comprehensive insights and visualizations.

## Features

- Dark/Light mode
- Responsive UI
- Real-time stock data
- Stock analysis across 10 dimensions
- Portfolio tracking
- Market insights

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Make sure you're in the frontend directory:
   ```
   cd stock-analyzer/frontend
   ```

2. Make the installation script executable:
   ```
   chmod +x install-and-run.sh
   ```

3. Run the installation script to install all dependencies:
   ```
   ./install-and-run.sh
   ```

   This will:
   - Install all dependencies from package.json
   - Ensure critical UI component libraries are installed
   - Start the development server

### Manual Installation

If the script doesn't work for you, you can install dependencies manually:

```bash
# Install all dependencies
npm install

# Make sure these specific dependencies are installed
npm install @radix-ui/react-slot @radix-ui/react-tabs class-variance-authority clsx tailwind-merge next-themes

# Start the development server
npm run dev
```

## Troubleshooting

If you encounter module not found errors, make sure all dependencies are properly installed:

```bash
# For UI components
npm install @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-progress class-variance-authority clsx tailwind-merge

# For theme functionality
npm install next-themes
```

### Common Issues:

1. **Missing UI Components**: If you see errors about missing UI components like button, card, tabs, or progress, make sure the shadcn/ui components are properly installed in the `components/ui` directory.

2. **Theme Issues**: The application uses next-themes for dark/light mode. If theme toggling doesn't work, check that next-themes is installed and ThemeProvider is properly set up in the layout.

3. **Cross-Origin Warning**: If you see a cross-origin warning in development mode, check that the `next.config.js` has the proper `allowedDevOrigins` setting for your local IP address.

4. **Next.js Config Warning**: To avoid "Invalid next.config.js options" warnings, make sure deprecated settings like `swcMinify` are removed.

## Backend Connection

The frontend is configured to connect to the backend at `http://localhost:5001`. Make sure the backend server is running before using API features.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
