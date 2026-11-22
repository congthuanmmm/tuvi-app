"""Local dev server for the Python API functions (Vercel runs them in production)."""
import os
import sys
from http.server import ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "api"))

from chart import handler  # noqa: E402

if __name__ == "__main__":
    port = int(os.environ.get("PY_API_PORT", "8001"))
    print(f"Python API on http://127.0.0.1:{port}/api/chart")
    ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
