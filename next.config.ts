import os from "node:os";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Dev-only origins allowed to load dev assets and open the HMR socket.
 *
 * Next 16 rejects cross-origin dev requests by default. Opening the app through
 * 127.0.0.1 or the LAN address printed by `next dev` therefore fails with
 * `WebSocket connection to 'ws://…/_next/webpack-hmr' failed` (the page itself
 * still renders, so the failure is easy to miss). The machine's own IPv4
 * addresses are allowed automatically; extra hostnames can be appended via
 * ALLOWED_DEV_ORIGINS=a.example.com,b.example.com. This option is dev-only and
 * has no effect on production builds.
 */
function lanIPv4Addresses(): string[] {
  const addresses: string[] = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) addresses.push(entry.address);
    }
  }
  return addresses;
}

const allowedDevOrigins = [
  ...new Set([
    "localhost",
    "127.0.0.1",
    ...lanIPv4Addresses(),
    ...(process.env.ALLOWED_DEV_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins,
};

export default nextConfig;
