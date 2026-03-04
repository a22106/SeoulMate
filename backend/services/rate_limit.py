from datetime import date
from threading import Lock

DAILY_LIMIT = 5

_lock = Lock()
_usage: dict[str, tuple[date, int]] = {}  # ip -> (date, count)


def check_rate_limit(ip: str) -> tuple[bool, int]:
    """Check if IP is within daily limit. Returns (allowed, remaining)."""
    today = date.today()
    with _lock:
        entry = _usage.get(ip)
        if entry is None or entry[0] != today:
            _usage[ip] = (today, 1)
            return True, DAILY_LIMIT - 1

        current_count = entry[1]
        if current_count >= DAILY_LIMIT:
            return False, 0

        _usage[ip] = (today, current_count + 1)
        return True, DAILY_LIMIT - current_count - 1
