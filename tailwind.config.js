/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: (theme) => ({
        DEFAULT: { // Base styles, will be overridden by .dark .prose and .light .prose in index.css
          css: {
            '--tw-prose-body': theme('colors.slate[700]'),
            '--tw-prose-headings': theme('colors.slate[900]'),
            '--tw-prose-lead': theme('colors.slate[600]'),
            '--tw-prose-links': theme('colors.blue[600]'),
            '--tw-prose-bold': theme('colors.slate[900]'),
            '--tw-prose-counters': theme('colors.slate[500]'),
            '--tw-prose-bullets': theme('colors.slate[400]'),
            '--tw-prose-hr': theme('colors.slate[200]'),
            '--tw-prose-quotes': theme('colors.slate[900]'),
            '--tw-prose-quote-borders': theme('colors.slate[300]'),
            '--tw-prose-captions': theme('colors.slate[500]'),
            '--tw-prose-code': theme('colors.purple[700]'),
            '--tw-prose-pre-code': theme('colors.slate[200]'),
            '--tw-prose-pre-bg': theme('colors.slate[800]'), // Default pre background
            '--tw-prose-th-borders': theme('colors.slate[300]'),
            '--tw-prose-td-borders': theme('colors.slate[200]'),

            // Dark mode specific prose variables (these are for when .dark is on html and .prose is used)
            '--tw-prose-invert-body': theme('colors.slate[300]'),
            '--tw-prose-invert-headings': theme('colors.white'),
            '--tw-prose-invert-lead': theme('colors.slate[400]'),
            '--tw-prose-invert-links': theme('colors.sky[400]'),
            '--tw-prose-invert-bold': theme('colors.white'),
            '--tw-prose-invert-counters': theme('colors.slate[400]'),
            '--tw-prose-invert-bullets': theme('colors.slate[600]'),
            '--tw-prose-invert-hr': theme('colors.slate[700]'),
            '--tw-prose-invert-quotes': theme('colors.slate[100]'),
            '--tw-prose-invert-quote-borders': theme('colors.slate[700]'),
            '--tw-prose-invert-captions': theme('colors.slate[400]'),
            '--tw-prose-invert-code': theme('colors.pink[400]'),
            '--tw-prose-invert-pre-code': theme('colors.slate[300]'),
            '--tw-prose-invert-pre-bg': theme('colors.slate[800]'), // Inverted pre background
            '--tw-prose-invert-th-borders': theme('colors.slate[600]'),
            '--tw-prose-invert-td-borders': theme('colors.slate[700]'),
          },
        },
        // It's better to control light/dark prose theming directly in index.css using .light .prose and .dark .prose
        // rather than relying solely on the 'invert' variant if you need more granular control.
        // The CSS variables above provide a good foundation for the plugin.
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};