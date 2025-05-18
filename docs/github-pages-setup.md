# Setting Up GitHub Pages for Stock-Sense

This guide will walk you through the process of setting up GitHub Pages for the Stock-Sense repository.

## Step 1: Enable GitHub Pages in Repository Settings

1. Go to the Stock-Sense repository on GitHub
2. Click on "Settings" tab
3. Scroll down to the "Pages" section in the left sidebar
4. Under "Build and deployment" > "Source", select "GitHub Actions" from the dropdown menu

## Step 2: Verify Workflow Permissions

1. In the repository settings, go to "Actions" > "General" in the left sidebar
2. Scroll down to "Workflow permissions"
3. Ensure "Read and write permissions" is selected
4. Make sure "Allow GitHub Actions to create and approve pull requests" is checked
5. Click "Save" if you made any changes

## Step 3: Run the Deployment Workflow

1. Go to the "Actions" tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow" and select the main branch
4. Wait for the workflow to complete

## Step 4: Verify Deployment

1. After the workflow completes successfully, go back to Settings > Pages
2. You should see a message saying "Your site is live at https://khushmevada1183.github.io/Stock-Sense/"
3. Click on the link to verify that your site is deployed correctly

## Troubleshooting

If your site is not deploying correctly:

1. Check the Actions tab for any errors in the workflow
2. Ensure that the `gh-pages` branch has been created by the workflow
3. Verify that the workflow has the correct permissions
4. Check that the Next.js configuration is set up correctly for static export

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Next.js Static Export Documentation](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 