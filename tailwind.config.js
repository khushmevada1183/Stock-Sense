/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neon colors for highlights
        neon: {
          50: '#f0fff4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#39ff14', // Main neon green
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        cyan: {
          400: '#00C2CB',
          500: '#00A8B0',
        },
      },
      boxShadow: {
        'neon-sm': '0 0 5px rgba(57, 255, 20, 0.3), 0 0 10px rgba(57, 255, 20, 0.1)',
        'neon': '0 0 10px rgba(57, 255, 20, 0.4), 0 0 25px rgba(57, 255, 20, 0.2), 0 0 40px rgba(57, 255, 20, 0.1)',
        'neon-lg': '0 0 15px rgba(57, 255, 20, 0.5), 0 0 35px rgba(57, 255, 20, 0.3), 0 0 60px rgba(57, 255, 20, 0.15)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'glass-hover': '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(57, 255, 20, 0.06)',
        'card-elevated': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(135deg, #39FF14, #00C2CB)',
        'neon-gradient-subtle': 'linear-gradient(135deg, rgba(57, 255, 20, 0.1), rgba(0, 194, 203, 0.1))',
        'dark-card': 'linear-gradient(145deg, rgba(18, 18, 18, 0.8), rgba(8, 8, 8, 0.9))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer-slide": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(57, 255, 20, 0.2), 0 0 15px rgba(57, 255, 20, 0.1)" },
          "50%": { boxShadow: "0 0 10px rgba(57, 255, 20, 0.4), 0 0 25px rgba(57, 255, 20, 0.2)" },
        },
        "subtle-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "shimmer": "shimmer-slide 2s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-up-slow": "fade-up 0.8s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "subtle-bounce": "subtle-bounce 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
