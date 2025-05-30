//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {
    svgr: false,
  },
  rewrites: async () => {
    return {
        beforeFiles: [
            {
                source: "/uniprice/store/it/login",
                destination: "/store/uniprice/it/login",
            },
            {
                source: "/uniprice/store/it",
                destination: "/store/uniprice/it",
            },
            {
                source: "/uniprice/store/it/:path(.*)",
                destination: "/store/uniprice/it/:path",
            },
            {
                source: "/store",
                destination: "/store/rica",
            },
            {
                source: "/store/:countryCode(it|ch|mt)/login",
                destination: "/store/rica/:countryCode/login",
            },
            {
                source: "/store/:countryCode(it|ch|mt)",
                destination: "/store/rica/:countryCode",
            },
            {
                source: "/store/:countryCode(it|ch|mt)/:path(.*)",
                destination: "/store/rica/:countryCode/:path",
            },
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
