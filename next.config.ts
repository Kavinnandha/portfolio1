import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        // Tailwind runs on global stylesheets only. CSS Modules are left to
        // Turbopack's native handling: routing them through this rule renames
        // them to "*.module.css.css", which silently turns them into global
        // CSS and drops their class names.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
