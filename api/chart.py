import json
import os
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "_lib"))

from ziwei_cli import build_output  # noqa: E402

MIN_YEAR, MAX_YEAR = 1900, 2100
MAX_BODY_BYTES = 4096


def compute_chart(payload: Any) -> tuple[int, dict[str, Any]]:
    if not isinstance(payload, dict):
        return 400, {"error": "Dữ liệu không hợp lệ"}
    birth = payload.get("birth_time")
    if not isinstance(birth, dict):
        return 400, {"error": "Thiếu ngày giờ sinh"}
    try:
        year = int(birth.get("year"))
    except (TypeError, ValueError):
        return 400, {"error": "Năm sinh không hợp lệ"}
    if not MIN_YEAR <= year <= MAX_YEAR:
        return 400, {"error": f"Năm sinh phải trong khoảng {MIN_YEAR}-{MAX_YEAR}"}

    request = {
        "calendar_type": payload.get("calendar_type", "solar"),
        "birth_time": birth,
        "gender": payload.get("gender"),
        "late_zi_rule": payload.get("late_zi_rule") or "next_day",
        "leap_month_rule": payload.get("leap_month_rule") or None,
        "query_year": payload.get("query_year") or datetime.now().year,
    }
    try:
        return 200, build_output(request)
    except (ValueError, KeyError, TypeError, AssertionError) as exc:
        return 400, {"error": str(exc)}


class handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: dict[str, Any]) -> None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BODY_BYTES:
            self._send(400, {"error": "Dữ liệu không hợp lệ"})
            return
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send(400, {"error": "JSON không hợp lệ"})
            return
        self._send(*compute_chart(payload))

    def do_GET(self) -> None:
        self._send(405, {"error": "Chỉ hỗ trợ POST"})
