//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  rewrites: async () => {
    return {
        beforeFiles: [
            {
                source: "/:brand(rica|uniprice)",
                destination: "/customer/:brand",
            },
            {
                source: "/:brand(rica|uniprice)/:path(.*)",
                destination: "/customer/:brand/:path",
            }
        ],
        fallback: [
            {
                source: '/:path(.*)',
                destination: '/customer/rica/:path'
            }
        ]
    };
  }
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
