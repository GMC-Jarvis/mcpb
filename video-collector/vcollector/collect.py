"""Collect, enrich, grade and rank candidate videos."""
from .grading import (PROVINCIAL, detect_regions, detect_themes, grade, parse_iso_duration, reason)

DEFAULT_QUERIES = [
    "foreigner first time in Korea travel vlog",
    "first time in Seoul Korea vlog",
    "Busan first time foreigners",
    "Jeju island travel vlog foreigner",
    "Daegu Korea travel foreigners",
    "Korea itinerary tips after visiting",
    "foreigners react Korea KTX subway",
    "Korea street food market foreigner",
]


def video_url(vid):
    return f"https://www.youtube.com/watch?v={vid}"


def collect(client, queries=None, per_query=25, cc_only=False, region="KR",
            published_after=None, min_views=0, limit=30):
    queries = queries or DEFAULT_QUERIES
    ids = []
    for q in queries:
        # Always run a CC-restricted pass so A-grade candidates are not drowned out.
        passes = [True] if cc_only else [True, False]
        for cc in passes:
            for vid in client.search(q, per_query, cc_only=cc, region=region,
                                     published_after=published_after):
                if vid not in ids:
                    ids.append(vid)
    items = client.videos(ids)
    countries = client.channel_countries([i["snippet"]["channelId"] for i in items])
    rows = []
    for it in items:
        sn, st = it["snippet"], it.get("statistics", {})
        views = int(st.get("viewCount", 0))
        if views < min_views:
            continue
        is_cc = it.get("status", {}).get("license") == "creativeCommon"
        dur = parse_iso_duration(it.get("contentDetails", {}).get("duration"))
        text = f"{sn['title']} {sn.get('description', '')[:500]} {' '.join(sn.get('tags', []))}"
        regions = detect_regions(text)
        g = grade(is_cc, sn["channelTitle"], dur, views)
        rows.append({
            "grade": g,
            "title": sn["title"],
            "url": video_url(it["id"]),
            "channel": sn["channelTitle"],
            "channel_country": countries.get(sn["channelId"], ""),
            "regions": ", ".join(regions) or "-",
            "provincial": any(r in PROVINCIAL for r in regions),
            "views": views,
            "duration_sec": dur,
            "published": sn["publishedAt"][:10],
            "license": "CC BY" if is_cc else "YouTube standard",
            "themes": ", ".join(detect_themes(text)) or "-",
            "advice": reason(g, is_cc),
        })
    # A first, then provincial (less competition), then views.
    rows.sort(key=lambda r: ("ABC".index(r["grade"]), not r["provincial"], -r["views"]))
    return rows[:limit]
