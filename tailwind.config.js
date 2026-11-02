/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        foreground: '#18181B',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#18181B'
        },
        border: '#E4E4E7',
        primary: {
          DEFAULT: '#18181B',
          foreground: '#FFFFFF',
          hover: '#27272A'
        },
        accent: {
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
          hover: '#4338CA'
        },
        brand: {
          forms: '#7248B9',
          formsDark: '#5E35B1'
        },
        muted: {
          DEFAULT: '#F4F4F5',
          foreground: '#71717A'
        },
        success: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF'
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['Geist', 'Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px'
      }
    },
  },
  plugins: [],
};
