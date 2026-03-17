import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const tailwindCssPath = fileURLToPath(new URL("./node_modules/tailwindcss/index.css", import.meta.url));
const twAnimateCssPath = fileURLToPath(new URL("./node_modules/tw-animate-css/dist/tw-animate.css", import.meta.url));
const shadcnTailwindCssPath = fileURLToPath(new URL("./node_modules/shadcn/dist/tailwind.css", import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: tailwindCssPath,
      "tw-animate-css": twAnimateCssPath,
      "shadcn/tailwind.css": shadcnTailwindCssPath,
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
