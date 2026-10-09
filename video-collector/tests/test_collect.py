import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from vcollector.collect import collect
from vcollector.export import to_csv, to_html
from vcollector.grading import detect_regions, parse_iso_duration
from vcollector.youtube import YouTubeClient, YouTubeError


def vid(i, title, ch, lic, views, cid="c1"):
    return {"id": i, "snippet": {"title": title, "channelTitle": ch, "channelId": cid,
            "publishedAt": "2025-01-02T00:00:00Z", "description": "", "tags": []},
            "statistics": {"viewCount": str(views)}, "contentDetails": {"duration": "PT10M5S"},
            "status": {"license": lic}}


def fake(url):
    if "/search?" in url:
        return {"items": [{"id": {"videoId": "a"}}, {"id": {"videoId": "b"}}, {"id": {"videoId": "n"}}]}
    if "/videos?" in url:
        return {"items": [vid("a", "Busan first time KTX", "Roseanne", "creativeCommon", 10),
                          vid("b", "Seoul vlog", "Trip Guy", "youtube", 999),
                          vid("n", "Seoul news", "KBS News", "creativeCommon", 5000)]}
    return {"items": [{"id": "c1", "snippet": {"country": "CA"}}]}


class T(unittest.TestCase):
    def test_grades_and_order(self):
        rows = collect(YouTubeClient("k", fake), ["q"], limit=10)
        self.assertEqual([r["grade"] for r in rows], ["A", "B", "C"])
        self.assertEqual(rows[0]["regions"], "Busan")
        self.assertTrue(rows[0]["provincial"])
        self.assertEqual(rows[0]["channel_country"], "CA")

    def test_min_views(self):
        self.assertEqual(len(collect(YouTubeClient("k", fake), ["q"], min_views=100)), 2)

    def test_helpers(self):
        self.assertEqual(parse_iso_duration("PT1H2M3S"), 3723)
        self.assertEqual(detect_regions("Jeju & 대구"), ["Jeju", "Daegu"])

    def test_no_key(self):
        with self.assertRaises(YouTubeError):
            YouTubeClient("")

    def test_export(self):
        rows = collect(YouTubeClient("k", fake), ["q"])
        d = tempfile.mkdtemp()
        to_csv(rows, d + "/o.csv")
        to_html(rows, d + "/o.html")
        self.assertIn("Roseanne", open(d + "/o.html").read())


if __name__ == "__main__":
    unittest.main()
