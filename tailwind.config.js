/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        critical: '#DC2626',
        warning: '#EA580C',
        info: '#0284C7',
        success: '#16A34A',
        'critical-bg': '#FFEBEE',
        'warning-bg': '#FFF3E0',
        'info-bg': '#E3F2FD',
        'success-bg': '#F0FDF4',
      },
    },
  },
  plugins: [],
}
