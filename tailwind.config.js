/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-optimized spacing scale
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // Touch-friendly minimum sizes
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },

      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },

      // Mobile-optimized font sizes
      fontSize: {
        'mobile-xs': ['12px', { lineHeight: '16px' }],
        'mobile-sm': ['14px', { lineHeight: '20px' }],
        'mobile-base': ['16px', { lineHeight: '24px' }],
        'mobile-lg': ['18px', { lineHeight: '28px' }],
        'mobile-xl': ['20px', { lineHeight: '32px' }],
      },

      // Enhanced shadows for mobile depth
      boxShadow: {
        'mobile-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'mobile': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'mobile-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'mobile-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'mobile-drag': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },

      // Animation for mobile interactions
      animation: {
        'mobile-bounce': 'mobile-bounce 0.15s ease-out',
        'mobile-pulse': 'mobile-pulse 1s ease-in-out infinite',
        'mobile-slide-up': 'mobile-slide-up 0.3s ease-out',
        'mobile-fade-in': 'mobile-fade-in 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },

      keyframes: {
        'mobile-bounce': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'mobile-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'mobile-slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'mobile-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },

      // Mobile-specific screen sizes
      screens: {
        'xs': '375px',
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1024px',
      },

      // Touch interaction colors
      colors: {
        'touch-feedback': 'rgba(0, 0, 0, 0.1)',
        'drag-highlight': '#10b981',
        'drag-highlight-light': '#ecfdf5',
        'selection-blue': '#3b82f6',
        'selection-blue-light': '#eff6ff',
      }
    },
  },
  plugins: [
    // Custom plugin for mobile utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Safe area utilities
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)'
        },
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)'
        },
        '.pl-safe': {
          paddingLeft: 'env(safe-area-inset-left)'
        },
        '.pr-safe': {
          paddingRight: 'env(safe-area-inset-right)'
        },
        '.p-safe': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        },

        // Touch-friendly interaction utilities
        '.touch-none': {
          touchAction: 'none'
        },
        '.touch-pan-x': {
          touchAction: 'pan-x'
        },
        '.touch-pan-y': {
          touchAction: 'pan-y'
        },
        '.touch-manipulation': {
          touchAction: 'manipulation'
        },

        // Mobile optimization base
        '.mobile-optimized': {
          '-webkit-touch-callout': 'none',
          '-webkit-user-select': 'none',
          '-webkit-tap-highlight-color': 'transparent',
          'touch-action': 'manipulation'
        },

        // Draggable utilities
        '.mobile-draggable': {
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
          transformOrigin: 'center',
          transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
          '&:active': {
            cursor: 'grabbing',
            transform: 'scale(1.05)',
            boxShadow: theme('boxShadow.mobile-drag')
          }
        },

        // Scroll optimization
        '.scroll-touch': {
          '-webkit-overflow-scrolling': 'touch',
          'overscroll-behavior': 'contain'
        },

        // Focus visible for accessibility
        '.focus-visible-mobile': {
          '&:focus-visible': {
            outline: '2px solid ' + theme('colors.blue.500'),
            outlineOffset: '2px'
          }
        }
      }

      addUtilities(newUtilities)
    },

    // Responsive typography plugin
    function({ addUtilities }) {
      const responsiveText = {
        '.text-responsive-xs': {
          fontSize: '12px',
          lineHeight: '16px',
          '@media (min-width: 768px)': {
            fontSize: '14px',
            lineHeight: '20px'
          }
        },
        '.text-responsive-sm': {
          fontSize: '14px',
          lineHeight: '20px',
          '@media (min-width: 768px)': {
            fontSize: '16px',
            lineHeight: '24px'
          }
        },
        '.text-responsive-base': {
          fontSize: '16px',
          lineHeight: '24px',
          '@media (min-width: 768px)': {
            fontSize: '18px',
            lineHeight: '28px'
          }
        },
        '.text-responsive-lg': {
          fontSize: '18px',
          lineHeight: '28px',
          '@media (min-width: 768px)': {
            fontSize: '20px',
            lineHeight: '32px'
          }
        }
      }

      addUtilities(responsiveText)
    }
  ],
}