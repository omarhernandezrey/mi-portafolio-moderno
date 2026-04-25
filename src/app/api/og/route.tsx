import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Omar Hernández Rey';
    const subtitle = searchParams.get('subtitle') || 'Full Stack Web Developer';

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: '#0d131a',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            color: '#d1d5db',
            border: '10px solid #00cba9',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Header/Branding */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '50px',
              fontSize: 24,
              color: '#00cba9',
              fontWeight: 'bold',
            }}
          >
            OMARHERNANDEZREY.COM
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '90%',
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 32,
                color: '#00cba9',
                marginBottom: '40px',
              }}
            >
              {subtitle}
            </div>
            
            <div
              style={{
                display: 'flex',
                background: '#00cba9',
                color: '#0d131a',
                padding: '12px 24px',
                borderRadius: '40px',
                fontSize: 24,
                fontWeight: 'bold',
              }}
            >
              PORTAFOLIO PROFESIONAL
            </div>
          </div>

          {/* Footer Decoration */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '50px',
              fontSize: 24,
              color: '#a1aab8',
            }}
          >
            ⚡ Powered by Next.js & IA
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(`OG Image error: ${(e as Error).message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
