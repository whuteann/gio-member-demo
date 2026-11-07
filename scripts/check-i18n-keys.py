#!/usr/bin/env python3
"""Fails loudly if any en/zh/ms translation JSON has mismatched key
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
    en_files = {p.name for p in en_dir.glob("*.json")}
    for locale in ("zh", "ms"):
        locale_dir = root / locale
        locale_files = {p.name for p in locale_dir.glob("*.json")}
        for name in sorted(en_files - locale_files):
            print(f"{name}: missing {locale} file")
            ok = False
        for name in sorted(locale_files - en_files):
            print(f"{name}: missing en file")
            ok = False
        for name in sorted(en_files & locale_files):
            en_keys = keys(json.loads((en_dir / name).read_text(encoding="utf-8")))
            locale_keys = keys(json.loads((locale_dir / name).read_text(encoding="utf-8")))
            if en_keys != locale_keys:
                ok = False
                print(f"{name}: en/{locale} key mismatch")
                if en_keys - locale_keys:
                    print("  en-only:", sorted(en_keys - locale_keys))
                if locale_keys - en_keys:
                    print(f"  {locale}-only:", sorted(locale_keys - en_keys))

    if ok:
        print("All English, Chinese and Malay translation keys match")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
