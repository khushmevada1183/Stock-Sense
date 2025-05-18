# Stock Sense Frontend Documentation

This directory contains documentation for the Stock Sense frontend application.

## Architecture Documents

- [News Section Architecture](./news-architecture.md) - Details the server/client component pattern used in the News section

## Development Guidelines

- Follow the established patterns for each section of the application
- For components that require client-side functionality with dynamic imports using `ssr: false`, follow the server/client component pattern described in the News Architecture document
- Maintain consistent styling using the Tailwind CSS classes already established

## Component Structure

The application is structured following Next.js App Router conventions:
- `/app` - Contains all pages and layouts
- `/components` - Reusable components organized by feature
- `/lib` - Utility functions and hooks
- `/public` - Static assets

## Adding New Features

When adding new features:
1. Check existing patterns in similar sections
2. Follow the server/client component pattern for pages with dynamic imports
3. Maintain consistent styling and UX
4. Update documentation as needed 