/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilita el modo oscuro basado en una clase
  content: [
    // Rutas corregidas para la estructura src/
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // Mantener compatibilidad con estructura raíz si es necesario
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Colores personalizados para trabajar con las variables CSS
      colors: {
        // Variables CSS dinámicas
        'primary': 'var(--primary-color)',
        'accent': 'var(--accent-color)',
        'background': 'var(--background-color)',
        'secondary-bg': 'var(--secondary-background-color)',
        'text-main': 'var(--text-color)',
        'text-muted': 'var(--muted-color)',
        'card-bg': 'var(--card-bg-color)',
        'white-custom': 'var(--white-color)',
      },
      // Fuentes optimizadas
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'var(--main-font-family)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Share Tech Mono', 'monospace'],
        main: ['var(--main-font-family)', 'Inter', 'sans-serif'],
      },
      // Animaciones mejoradas
      animation: {
        fadeIn: "fadeIn 0.7s ease-in-out forwards",
        fadeInUp: "fadeInUp 1s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        gradient: "gradient 5s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { 
            opacity: "0", 
            transform: "translateY(20px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      // Efectos especiales para las paletas
      boxShadow: {
        'neon': 'var(--neon-glow, 0 0 10px rgba(255, 0, 255, 0.5))',
        'leaf': 'var(--leaf-shadow, 0 4px 6px rgba(76, 175, 80, 0.2))',
        'wave': 'var(--wave-shadow, 0 4px 8px rgba(0, 180, 216, 0.3))',
        'royal': 'var(--royal-glow, 0 0 10px rgba(156, 39, 176, 0.5))',
        'custom-primary': '0 8px 25px color-mix(in srgb, var(--primary-color) 30%, transparent)',
        'custom-accent': '0 4px 15px color-mix(in srgb, var(--accent-color) 25%, transparent)',
      },
      // Gradientes dinámicos
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
        'gradient-sunset': 'var(--sunset-gradient, linear-gradient(135deg, #ff6b6b, #ffb347))',
        'gradient-gold': 'var(--gold-gradient, linear-gradient(135deg, #c5961f, #ffd65a))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      // Espaciado personalizado
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Tamaños de pantalla adicionales
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      // Transiciones suaves
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      // Filtros especiales
      backdropBlur: {
        xs: '2px',
      },
      // Z-index organizados
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    // Plugin para formularios (opcional, comenta si no lo usas)
    // require("@tailwindcss/forms"),
    
    // Plugin personalizado para utilidades adicionales
    function({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0,0,0,0.5)',
        },
        '.bg-glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
};