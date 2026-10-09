import argparse
import os
import sys

from .collect import DEFAULT_QUERIES, collect
from .export import to_csv, to_html, to_json
from .youtube import YouTubeClient, YouTubeError


def main(argv=None):
    p = argparse.ArgumentParser(prog="vcollector", description="Collect foreigner-in-Korea videos, grade A/B/C.")
    p.add_argument("-q", "--query", action="append", help="search query (repeatable); default set used if omitted")
    p.add_argument("--per-query", type=int, default=25)
    p.add_argument("--limit", type=int, default=30)
    p.add_argument("--min-views", type=int, default=0)
    p.add_argument("--cc-only", action="store_true", help="only Creative Commons videos")
    p.add_argument("--region", default="KR")
    p.add_argument("--published-after", help="RFC3339, e.g. 2024-01-01T00:00:00Z")
    p.add_argument("-o", "--out", default="out", help="output basename (writes .csv .json .html)")
    a = p.parse_args(argv)
    try:
        client = YouTubeClient(os.environ.get("YOUTUBE_API_KEY"))
        rows = collect(client, a.query or DEFAULT_QUERIES, a.per_query, a.cc_only, a.region,
                       a.published_after, a.min_views, a.limit)
    except YouTubeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    to_csv(rows, a.out + ".csv")
    to_json(rows, a.out + ".json")
    to_html(rows, a.out + ".html")
    n = {g: sum(r["grade"] == g for r in rows) for g in "ABC"}
    print(f"{len(rows)} videos (A={n['A']} B={n['B']} C={n['C']}) -> {a.out}.csv/.json/.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
