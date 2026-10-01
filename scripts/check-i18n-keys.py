#!/usr/bin/env python3
"""Fails loudly if any en/zh translation JSON pair has mismatched key
sets — see docs/behaviour_log_0001.md. Run via `npm run check:i18n`."""
from pathlib import Path
import json
import sys

root = Path(__file__).resolve().parent.parent / "public" / "locales"


def keys(value, prefix=""):
    if isinstance(value, dict):
        return {
            key
            for name, item in value.items()
            for key in keys(item, f"{prefix}.{name}" if prefix else name)
        }
    return {prefix}


def main() -> int:
    ok = True
    en_dir = root / "en"
    zh_dir = root / "zh"
    en_files = {p.name for p in en_dir.glob("*.json")}
    zh_files = {p.name for p in zh_dir.glob("*.json")}

    for name in sorted(en_files - zh_files):
        print(f"{name}: missing zh file")
        ok = False
    for name in sorted(zh_files - en_files):
        print(f"{name}: missing en file")
        ok = False

    for name in sorted(en_files & zh_files):
        en_keys = keys(json.loads((en_dir / name).read_text()))
        zh_keys = keys(json.loads((zh_dir / name).read_text()))
        if en_keys != zh_keys:
            ok = False
            print(f"{name}: key mismatch")
            if en_keys - zh_keys:
                print("  en-only:", sorted(en_keys - zh_keys))
            if zh_keys - en_keys:
                print("  zh-only:", sorted(zh_keys - en_keys))

    if ok:
        print("All English and Chinese translation keys match")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
