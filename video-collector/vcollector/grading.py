"""Region detection, shorts-material hints and A/B/C recreation grading."""
import re

REGIONS = {
    "Seoul": ["seoul", "서울", "gyeongbokgung", "itaewon", "hongdae", "myeongdong", "gangnam"],
    "Busan": ["busan", "부산", "haeundae", "gamcheon"],
    "Jeju": ["jeju", "제주"],
    "Daegu": ["daegu", "대구"],
    "Ulsan": ["ulsan", "울산"],
    "Gyeongju": ["gyeongju", "경주"],
    "Jeonju": ["jeonju", "전주"],
    "Incheon": ["incheon", "인천"],
    "Gangneung": ["gangneung", "강릉", "sokcho", "속초"],
    "DMZ": ["dmz"],
}
PROVINCIAL = {"Busan", "Jeju", "Daegu", "Ulsan", "Gyeongju", "Jeonju", "Gangneung"}

THEMES = {
    "transport (KTX/subway/bus)": ["ktx", "subway", "metro", "bus", "train", "지하철"],
    "food/market": ["food", "eat", "market", "street food", "korean bbq", "mukbang", "시장"],
    "culture/hanbok/palace": ["hanbok", "palace", "temple", "culture", "한복"],
    "first impressions/reaction": ["first time", "first impression", "reaction", "shocked", "surprised", "첫"],
    "itinerary/tips": ["itinerary", "guide", "things to do", "tips", "mistakes", "budget"],
    "cafe/city life": ["cafe", "skycapsule", "sky capsule", "salt bread", "living in"],
}

# Broadcasters / news / clip-farm channels: research only (grade C).
C_CHANNEL = re.compile(r"\b(kbs|mbc|sbs|ytn|jtbc|tvn|arirang|news|뉴스|clip|shorts?)\b|방송", re.I)

KOREAN_CHANNEL = re.compile(r"[가-힣]")


def detect_regions(text):
    t = text.lower()
    return [r for r, kws in REGIONS.items() if any(k in t for k in kws)]


def detect_themes(text):
    t = text.lower()
    return [n for n, kws in THEMES.items() if any(k in t for k in kws)]


def grade(is_cc, channel_title, duration_sec, views):
    """A: CC BY -> real footage may be reused (with attribution, <=30% quoted).
    B: normal license -> use as topic reference only, rebuild with own assets.
    C: broadcaster/clip channel or tiny/low-signal -> research only."""
    if C_CHANNEL.search(channel_title or ""):
        return "C"
    if is_cc:
        return "A"
    return "B"


def reason(g, is_cc):
    return {
        "A": "CC BY: 원본 장면 일부 사용 가능(출처 표기 필수). 자체 나레이션·자료로 70%+ 재구성.",
        "B": "일반 라이선스: 소재·정보만 참고. 영상은 AI 이미지/라이선스 영상으로 새로 제작.",
        "C": "방송/클립 채널: 소재 조사 전용. 영상 사용 금지.",
    }[g]


def parse_iso_duration(s):
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    if not m:
        return 0
    d, h, mi, se = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + se
