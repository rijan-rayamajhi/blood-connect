// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require("@sentry/nextjs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    // Add other config options here
};

module.exports = withSentryConfig(
    withPWA(nextConfig),
    {
        org: process.env.SENTRY_ORG || "bloodconnect",
        project: process.env.SENTRY_PROJECT || "bloodconnect",
        silent: !process.env.CI,
        widenClientFileUpload: true,
        hideSourceMaps: true,
    }
);
