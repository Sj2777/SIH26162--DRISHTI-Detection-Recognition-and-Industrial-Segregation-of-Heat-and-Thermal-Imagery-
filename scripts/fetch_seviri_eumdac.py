#!/usr/bin/env python3
"""
Convenience CLI runner for EUMETSAT SEVIRI data fetching with eumdac.
Usage:
    python scripts/fetch_seviri_eumdac.py status
    python scripts/fetch_seviri_eumdac.py search --hours 3
    python scripts/fetch_seviri_eumdac.py sync
    python scripts/fetch_seviri_eumdac.py serve --port 5174
"""
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from seviri_eumdac import main

if __name__ == "__main__":
    main()
