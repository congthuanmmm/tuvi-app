import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "api"))

from chart import compute_chart  # noqa: E402

FIXTURES = json.loads((Path(__file__).parent / "iztro_cases.json").read_text(encoding="utf-8"))["cases"]


def _payload(birth_time: str, gender: str) -> dict:
    d, t = birth_time.split()
    y, m, day = (int(x) for x in d.split("-"))
    h, mi = (int(x) for x in t.split(":"))
    return {"birth_time": {"year": y, "month": m, "day": day, "hour": h, "minute": mi}, "gender": gender}


def test_matches_iztro_reference_charts():
    for case in FIXTURES:
        status, out = compute_chart(_payload(case["input"]["birth_time"], case["input"]["gender"]))
        assert status == 200, out
        expected = case["iztro"]
        assert out["chart"]["ming_gong"]["branch"] == expected["ming"]
        assert out["chart"]["wuxing_ju"]["name"] == expected["ju"]
        for star, branch in expected["stars"].items():
            assert out["chart"]["star_index"][star] == branch, (case["input"], star)


def test_includes_current_horoscope_by_default():
    status, out = compute_chart(_payload("1990-06-15 08:30", "男"))
    assert status == 200
    assert out["horoscope"]["decadal"] is not None
    assert len(out["chart"]["palaces"]) == 12


def test_lunar_input():
    payload = _payload("1990-05-23 08:30", "女")
    payload["calendar_type"] = "lunar"
    status, out = compute_chart(payload)
    assert status == 200
    assert out["calendar"]["lunar_month"] == 5 and out["calendar"]["lunar_day"] == 23


def test_rejects_bad_input():
    assert compute_chart([])[0] == 400
    assert compute_chart({"birth_time": {"year": 1800, "month": 1, "day": 1, "hour": 0}, "gender": "男"})[0] == 400
    status, out = compute_chart({"birth_time": {"year": 1990, "month": 2, "day": 30, "hour": 1}, "gender": "男"})
    assert status == 400 and "error" in out
    assert compute_chart({"birth_time": {"year": 1990, "month": 1, "day": 1, "hour": 1}})[0] == 400
