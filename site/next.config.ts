import type { NextConfig } from "next";

const supabaseHostname = (() => {
  try { return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null; } catch { return null; }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/property-images/**" }] : [],
  },
  async headers() {
    return [{ source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }] }];
  },
};

export default nextConfig;
