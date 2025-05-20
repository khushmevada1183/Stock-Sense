# Manual Installation Guide

If you're experiencing issues with the automatic installation script, follow these step-by-step instructions to install all the necessary dependencies manually.

## Step 1: Install Core Dependencies

```bash
npm install
```

## Step 2: Install UI Component Libraries

```bash
npm install @radix-ui/react-slot @radix-ui/react-tabs class-variance-authority clsx tailwind-merge
```

## Step 3: Install Theme Support

```bash
npm install next-themes
```

## Step 4: For the Progress Component (Choose One Option)

### Option A: Install Radix UI Progress Component
```bash
npm install @radix-ui/react-progress
```

### Option B: Use the Custom Implementation
If the Radix UI progress component is causing issues, we've provided a simplified custom implementation that doesn't rely on the Radix UI library. This is already in the codebase at `components/ui/progress.tsx`.

## Step 5: Start the Development Server

```bash
npm run dev
```

## Troubleshooting

### If you see errors about missing modules:

Try clearing your Next.js cache:
```bash
rm -rf .next
```

Or with npm:
```bash
npm run clean
```

### If you still have issues with modules:

Try a fresh install:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

Then install the UI libraries again (Steps 2-4 above).

### If you see Next.js configuration warnings:

The `next.config.js` file has been updated to remove deprecated options and add development origin settings. If you're still seeing warnings, make sure your `next.config.js` matches the latest version in the repository. 