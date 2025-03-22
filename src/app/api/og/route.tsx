import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    // Assuming opengraph.png is in the public directory
    // This will fetch it from your deployed site or localhost during development
    const imageResponse = await fetch(new URL('/opengraph.png', 'https://gpsim.vercel.app').href);
    
    // If the fetch was successful, return the image data with proper headers
    if (imageResponse.ok) {
      const imageData = await imageResponse.arrayBuffer();
      
      return new Response(imageData, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        }
      });
    } else {
      return new Response('Failed to fetch image', { status: 500 });
    }
  } catch (error) {
    return new Response('Error serving image', { status: 500 });
  }
}
