import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Omar Hernández Rey | Full Stack Developer';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
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
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
          }}
        >
          {/* Profile Picture Mockup - Next.js OG can fetch images, but for simplicity we'll use a styled div with color if needed, 
              but since we have the image in public, we should try to use it if possible or use a nice representation.
              To avoid complex fetching in edge, we'll use a nice layout with the name and a highlighted pill. */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '10px',
              }}
            >
              Omar Hernández Rey
            </div>
            <div
              style={{
                fontSize: 36,
                color: '#00cba9',
                marginBottom: '30px',
              }}
            >
              Full Stack Web Developer
            </div>
            <div
              style={{
                display: 'flex',
                background: '#00cba9',
                color: '#0d131a',
                padding: '10px 20px',
                borderRadius: '30px',
                fontSize: 24,
                fontWeight: 'bold',
              }}
            >
              🟢 DISPONIBLE PARA PROYECTOS / AVAILABLE FOR PROJECTS
            </div>
          </div>
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 24,
            color: '#a1aab8',
          }}
        >
          omarhernandezrey.com
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
