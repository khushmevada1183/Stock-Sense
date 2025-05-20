# Indian Stock Analyzer - Usage Guide

## ⚠️ IMPORTANT: WHICH FILE TO USE ⚠️

Always use **ONLY ONE** of these starter scripts:

- **`start.bat`** - This is the RECOMMENDED way to start the application on Windows
- **`start.sh`** - This is the RECOMMENDED way to start the application on Mac/Linux

**DO NOT use `run.bat` or `run.js` directly** - they are only meant to be called by the starter scripts!

## Running the Application - The Easy Way

The starter scripts will work from **any directory**. They automatically navigate to the correct location and run the application:

### Windows Users:
1. Simply double-click `start.bat` file from any location
2. The application will start in the correct directory

### Mac/Linux Users:
1. Run the start script from any location with `./path/to/start.sh` 
2. The application will start in the correct directory

## Avoiding Directory Errors

When running Node.js scripts or npm commands, you must be in the correct directory:

**CORRECT:**
```bash
# Using the recommended starter scripts
C:\Users\khush\Desktop\extra\New folder (2)\stock-analyzer\start.bat
```

**INCORRECT:**
```bash
# Using run.bat or run.js directly from wrong directories
C:\Users\khush\Desktop\extra\New folder (2)\run.bat  # This will fail!
C:\Users\khush\Desktop\extra\New folder (2)\node run.js  # This will fail!
```

## Common Directory-Related Errors

If you see any of these errors, you're likely using the wrong script or running it from the wrong location:

1. **"Cannot find module 'C:\path\to\run.js'"** - This means you're using `run.bat` directly
2. **"Cannot find module"** - Node.js can't find a required file because you're in the wrong location
3. **"No such file or directory"** - The file exists, but not in your current location

## Commands That Work From Any Directory

I've created these commands to work regardless of where you are:

### Windows:
```
C:\anywhere\on\your\system> C:\Users\khush\Desktop\extra\New folder (2)\stock-analyzer\start.bat
```

### Mac/Linux:
```
~/anywhere/on/your/system$ /path/to/stock-analyzer/start.sh
```

## Creating Desktop Shortcuts (Recommended)

For convenience, you can:

1. Right-click on your desktop
2. Select "New" > "Shortcut"
3. Browse to `C:\Users\khush\Desktop\extra\New folder (2)\stock-analyzer\start.bat`
4. Name it "Indian Stock Analyzer"

Now you can start the application with a single click from your desktop! 