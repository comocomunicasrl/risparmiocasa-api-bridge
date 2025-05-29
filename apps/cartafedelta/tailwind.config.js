const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
        extend: {
            backgroundColor: {
                'risparmiocasa-blue': '#17458E',
                'brand-primary': 'var(--brand-primary)',
            },
            borderColor: {
                'risparmiocasa-dark-blue': '#02103D',
                'risparmiocasa-neutral': '#D1D4D9',
                'brand-dark-primary': 'var(--brand-dark-primary)',
                'brand-neutral': 'var(--brand-neutral)'
            },
            textColor: {
                'risparmiocasa-light-blue': '#3D90DF',
                'brand-light-primary': 'var(--brand-light-primary)'
            },
        },
    },
  plugins: [],
};
