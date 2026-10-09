# Korea Video Collector

외국인 한국 여행 영상을 수집해 **CC 라이선스 여부 · 지역 · 조회수 · 쇼츠 소재**를 뽑고
재창작 등급(A/B/C)을 매기는 CLI. 의존성 없음(Python 3.9+).

```bash
export YOUTUBE_API_KEY=...      # Google Cloud > YouTube Data API v3
python -m vcollector --limit 30 --min-views 10000 -o korea
python -m vcollector -q "Daegu foreigners" --cc-only -o cc
python tests/test_collect.py
```
출력: `korea.csv`(엑셀), `korea.json`, `korea.html`(등급 필터·정렬).

## 등급
- **A** CC BY(`status.license=creativeCommon`) — 장면 일부 사용 + 출처 표기, 자체 콘텐츠 70%+
- **B** 일반 라이선스 — 소재만 참고, 영상은 새로 제작
- **C** 방송/뉴스/클립 채널 — 조사 전용

정렬: A → 지방(부산·제주·대구·울산 등, 경쟁 약함) → 조회수.

## 주의
- CC 필터는 *영상 단위*이며 업로더가 CC로 설정했어도 영상 안의 제3자 음악·클립은 별개 권리일 수 있습니다. 사용 전 직접 확인하세요.
- CC여도 YouTube 수익화의 "재사용 콘텐츠" 정책이 적용됩니다.
- 검색 쿼터: search 100 units/호출 (기본 일 10,000 units).
