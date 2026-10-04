import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Family Personal Finance Manager',
    short_name: 'Family Finance',
    description: 'Manage your family finances together',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Quick Expense',
        short_name: 'Add Expense',
        description: 'Quickly record a daily household expense',
        url: '/transactions?quickAdd=true',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Financial Reports',
        short_name: 'Reports',
        description: 'View monthly spending trends & savings',
        url: '/reports',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
