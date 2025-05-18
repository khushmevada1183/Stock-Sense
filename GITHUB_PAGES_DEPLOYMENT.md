# Deploying Stock-Sense to GitHub Pages

This document provides instructions on how to deploy the Stock-Sense application to GitHub Pages.

## Automatic Deployment

The repository is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch. This is handled by the GitHub Actions workflow in `.github/workflows/deploy.yml`.

## Manual Deployment

If you need to manually trigger a deployment:

1. Go to the GitHub repository
2. Navigate to the "Actions" tab
3. Select the "Deploy to GitHub Pages" workflow
4. Click "Run workflow" and select the branch you want to deploy

## Configuration

The application is configured to work with GitHub Pages through the following settings:

1. `next.config.js` is configured with:
   - `output: 'export'` to generate static HTML files
   - `basePath` and `assetPrefix` set to `/Stock-Sense` for GitHub Pages
   - `images.unoptimized: true` to allow static image exports

2. A `.nojekyll` file is added to the `public` folder to prevent GitHub Pages from processing the files with Jekyll

## Accessing the Deployed Application

Once deployed, the application will be available at:
https://khushmevada1183.github.io/Stock-Sense/

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for any errors
2. Ensure the repository has GitHub Pages enabled in Settings > Pages
3. Verify that the source branch for GitHub Pages is set to `gh-pages`
4. Make sure all paths in the application use the `basePath` when referencing internal resources

## Local Testing of Production Build

To test the production build locally before deploying:

```bash
# Navigate to the frontend directory
cd frontend

# Build the application
npm run build

# Start a local server to preview the build
npx serve out
```

This will start a local server with the production build, allowing you to verify everything works as expected before deploying to GitHub Pages. 