# Redeploying Your Application on Render

Follow these steps to redeploy your application after making the changes:

## 1. Push Changes to GitHub

First, push all the changes we've made to your GitHub repository:

```bash
git add .
git commit -m "Fix deployment configuration for Render"
git push
```

## 2. Redeploy on Render

1. Log in to your Render dashboard
2. Go to your service
3. Click on "Manual Deploy" > "Deploy latest commit"

OR

If your service is set up for automatic deployments, it will redeploy automatically when you push to the branch you've configured.

## 3. Verify Environment Variables

Make sure your Render service has the following environment variables set:

- `NODE_ENV`: production
- `PORT`: 10000
- `FRONTEND_PORT`: 10001
- `STOCK_API_KEY`: (your API key)
- `NEXT_PUBLIC_API_URL`: http://localhost:10000/api
- `NEXT_PUBLIC_APP_ENV`: production

## 4. Monitor Deployment

Once the deployment starts, monitor the logs for any errors. The deployment should:

1. Install all dependencies
2. Build the backend
3. Build the frontend
4. Start the application with `node run.js`

## 5. Troubleshooting

If you encounter issues:

- Check the logs for error messages
- Verify that the frontend build succeeds
- Confirm that all environment variables are set correctly
- Make sure the `STOCK_API_KEY` is valid and has available quota 