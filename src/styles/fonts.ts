import localFont from 'next/font/local'

export const customFont = localFont({
  src: [
    {
      path: '../../public/fonts/your-font-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/your-font-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    // Add other weights/styles if available
  ],
  variable: '--font-custom' // This creates a CSS variable
})
