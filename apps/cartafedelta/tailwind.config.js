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
            },
            borderColor: {
                'risparmiocasa-dark-blue': '#02103D',
                'risparmiocasa-neutral': '#D1D4D9',
            },
            textColor: {
                'risparmiocasa-light-blue': '#3D90DF',
            },
        },
    },
  plugins: [],
};
