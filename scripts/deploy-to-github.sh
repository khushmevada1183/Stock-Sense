#!/bin/bash

# Deploy Stock-Sense to GitHub Pages

# Set variables
GITHUB_REPO="https://github.com/khushmevada5005/stock-sense-build.git"
BRANCH="main"

echo "===== Stock-Sense GitHub Pages Deployment ====="
echo "This script will commit and push changes to your GitHub repository"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: Git is not installed. Please install Git and try again."
    exit 1
fi

# Check if the directory is a git repository
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git remote add origin $GITHUB_REPO
else
    echo "Git repository already initialized."
    # Check if the remote exists
    if ! git remote | grep -q "origin"; then
        git remote add origin $GITHUB_REPO
    fi
fi

# Configure Git if needed
echo "Configuring Git..."
if [ -z "$(git config user.name)" ]; then
    read -p "Enter your Git username: " git_username
    git config user.name "$git_username"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Enter your Git email: " git_email
    git config user.email "$git_email"
fi

# Add all files to git
echo "Adding files to Git..."
git add .

# Commit changes
echo "Committing changes..."
read -p "Enter commit message (default: 'Update for GitHub Pages deployment'): " commit_message
commit_message=${commit_message:-"Update for GitHub Pages deployment"}
git commit -m "$commit_message"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin $BRANCH

echo "===== Deployment Complete ====="
echo "Your code has been pushed to $GITHUB_REPO"
echo "GitHub Pages will be available at: https://khushmevada1183.github.io/Stock-Sense/"
echo "Note: It may take a few minutes for GitHub Pages to build and deploy your site." 