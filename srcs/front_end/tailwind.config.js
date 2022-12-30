/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      
      colors: {
        whathsapp_uns: '#111b21',
        whathsapp_selctd: '#2a3942'
      }
    },
  },
  plugins: [
  ],
}
