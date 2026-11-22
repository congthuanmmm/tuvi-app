import type { NextConfig } from "next";

const pyApiPort = process.env.PY_API_PORT ?? "8001";

const nextConfig: NextConfig = {
  // Trên Vercel, /api/chart chạy bằng Python function (api/chart.py).
  // Khi chạy local, chuyển tiếp sang scripts/dev_api.py.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [{ source: "/api/chart", destination: `http://127.0.0.1:${pyApiPort}/api/chart` }];
  },
};

export default nextConfig;
