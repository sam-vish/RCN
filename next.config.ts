import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind v4 via the Turbopack loader (same setup as the AAO site).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    qualities: [60, 75, 90],
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  async redirects() {
    return [
      // Short links from the client brief.
      { source: "/boston", destination: "/branches/boston", permanent: false },
      { source: "/florida", destination: "/branches/orlando-florida", permanent: false },
      { source: "/orlando", destination: "/branches/orlando-florida", permanent: false },
      // Friendly aliases.
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/give", destination: "/giving", permanent: true },
      { source: "/messages", destination: "/sermons", permanent: true },
    ];
  },
};

export default nextConfig;
