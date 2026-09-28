export function GET() {
  const manifest = {
    name: 'MGL 365 Admin',
    short_name: 'MGL 365 Admin',
    description: 'MGL 365 Management admin panel.',
    start_url: '/admin',
    scope: '/',
    display: 'standalone',
    background_color: '#1f5772',
    theme_color: '#1f5772',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }

  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
