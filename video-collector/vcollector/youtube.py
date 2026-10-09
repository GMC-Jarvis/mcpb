"""Minimal YouTube Data API v3 client (stdlib only)."""
import json
import urllib.parse
import urllib.request

BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeError(RuntimeError):
    pass


class YouTubeClient:
    def __init__(self, api_key, fetch=None):
        if not api_key:
            raise YouTubeError("YOUTUBE_API_KEY is required (Google Cloud > YouTube Data API v3)")
        self.api_key = api_key
        self._fetch = fetch or self._http

    def _http(self, url):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            raise YouTubeError(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}") from e

    def _get(self, path, **params):
        params["key"] = self.api_key
        return self._fetch(f"{BASE}/{path}?{urllib.parse.urlencode(params)}")

    def search(self, query, max_results=50, cc_only=False, region=None,
               published_after=None, order="viewCount", duration=None):
        """Return video ids. cc_only uses videoLicense=creativeCommon (CC BY)."""
        params = dict(part="id", q=query, type="video", maxResults=min(max_results, 50), order=order)
        if cc_only:
            params["videoLicense"] = "creativeCommon"
        if region:
            params["regionCode"] = region
        if published_after:
            params["publishedAfter"] = published_after
        if duration:
            params["videoDuration"] = duration
        data = self._get("search", **params)
        return [i["id"]["videoId"] for i in data.get("items", []) if "videoId" in i.get("id", {})]

    def videos(self, ids):
        out = []
        for i in range(0, len(ids), 50):
            data = self._get("videos", part="snippet,statistics,contentDetails,status",
                             id=",".join(ids[i:i + 50]))
            out.extend(data.get("items", []))
        return out

    def channel_countries(self, channel_ids):
        res = {}
        ids = sorted(set(channel_ids))
        for i in range(0, len(ids), 50):
            data = self._get("channels", part="snippet", id=",".join(ids[i:i + 50]))
            for c in data.get("items", []):
                res[c["id"]] = c["snippet"].get("country", "")
        return res
