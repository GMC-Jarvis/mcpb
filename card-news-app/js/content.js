/**
 * 채널별 기본 프로필 + 바이럴 카드뉴스 문구 추천 데이터
 * 카테고리: info(정보) / society(사회) / entertainment(연예) / economy(경제) / issue(이슈)
 */

const CHANNELS = [
  {
    id: "info",
    order: 1,
    name: "정보카드뉴스",
    handle: "@info.cardnews",
    color: "#3B82F6",
    gradient: ["#1E3A8A", "#3B82F6"],
    bio: "모르면 손해보는 꿀정보만 골라서 알려드려요 📌 매일 저녁 8시 업로드",
    avatar: null,
  },
  {
    id: "society",
    order: 2,
    name: "사회카드뉴스",
    handle: "@society.cardnews",
    color: "#0EA5E9",
    gradient: ["#0C4A6E", "#0EA5E9"],
    bio: "지금 우리 사회, 놓치면 안 되는 이야기 🗞️ 팩트만 담백하게",
    avatar: null,
  },
  {
    id: "entertainment",
    order: 3,
    name: "연예카드뉴스",
    handle: "@enter.cardnews",
    color: "#EC4899",
    gradient: ["#831843", "#EC4899"],
    bio: "스타들의 모든 순간, 가장 빠르게 ✨ 덕질러 필수 팔로우",
    avatar: null,
  },
  {
    id: "economy",
    order: 4,
    name: "경제카드뉴스",
    handle: "@economy.cardnews",
    color: "#22C55E",
    gradient: ["#14532D", "#22C55E"],
    bio: "월급쟁이도 이해되는 경제 이야기 💰 재테크 인사이트 매일 공유",
    avatar: null,
  },
  {
    id: "issue",
    order: 5,
    name: "이슈카드뉴스",
    handle: "@issue.cardnews",
    color: "#F97316",
    gradient: ["#7C2D12", "#F97316"],
    bio: "지금 전국이 검색 중인 그 이슈 🔥 실시간 화제성 정리",
    avatar: null,
  },
];

/**
 * 카테고리별 바이럴 카드뉴스 세트(슬라이드 여러 장). 클릭 한 번으로 에디터에 채워 넣는다.
 * hook: 표지(1번 슬라이드)용 강한 후킹 문구, slides: 이후 내용 슬라이드
 */
const VIRAL_SETS = {
  info: [
    {
      title: "모르면 나만 손해보는 정부지원금 5가지",
      slides: [
        { title: "이거 아는 사람만 받아갑니다", body: "매년 신청 안 해서 날아가는 지원금, 무려 수십만 원" },
        { title: "1. 청년 월세 지원", body: "만 19~34세, 최대 20만 원씩 12개월 지원" },
        { title: "2. 에너지 바우처", body: "여름·겨울 냉난방비 미리 신청하면 자동 지급" },
        { title: "3. 문화누리카드", body: "연 13만 원, 공연·영화·도서에 자유롭게 사용" },
        { title: "저장 안 하면 다음 달에 또 까먹습니다", body: "지금 바로 저장하고 신청 링크 확인하세요" },
      ],
    },
    {
      title: "스마트폰 배터리 수명 2배 늘리는 법",
      slides: [
        { title: "매일 쓰는데 아무도 안 알려준 사실", body: "충전 습관 하나만 바꿔도 배터리 수명이 확 달라져요" },
        { title: "1. 20~80% 구간 유지", body: "0%까지 방전, 100% 완충은 배터리에 최악" },
        { title: "2. 고온 환경 피하기", body: "차 안 방치, 직사광선 아래 충전 금지" },
        { title: "3. 고속충전 상시 사용 자제", body: "급할 때만, 평소엔 일반 충전 권장" },
        { title: "저장해두고 오늘부터 실천해보세요", body: "친구에게 공유하면 더 오래 씁니다" },
      ],
    },
  ],
  society: [
    {
      title: "요즘 2030이 결혼 대신 선택하는 것",
      slides: [
        { title: "결혼정보회사도 놀란 요즘 세대 선택", body: "통계로 본 2030의 진짜 속마음" },
        { title: "비혼 동거, 3년 새 2배 증가", body: "법적 결혼 없이도 함께 사는 삶을 택하는 사람들" },
        { title: "이유 1위는 '경제적 부담'", body: "결혼식·주거비 부담이 결혼을 미루게 만든다" },
        { title: "제도는 아직 못 따라가고 있다", body: "동거 커플을 위한 법적 보호는 여전히 사각지대" },
        { title: "당신의 생각은 어떤가요?", body: "댓글로 의견 남겨주세요" },
      ],
    },
  ],
  entertainment: [
    {
      title: "공개 3시간 만에 실검 1위 찍은 이유",
      slides: [
        { title: "터졌다… 공개 3시간 만에 실검 올킬", body: "무슨 일이 있었는지 지금 바로 정리해드립니다" },
        { title: "무대 직캠 조회수 폭발", body: "업로드 1시간 만에 500만 뷰 돌파" },
        { title: "팬들 반응 \"소름 돋았다\"", body: "실시간 댓글창이 감탄 일색" },
        { title: "다음 컴백은 언제?", body: "소속사 측 \"아직 정해진 바 없다\" 공식 입장" },
        { title: "저장하고 친구 소환하세요", body: "이 소식, 나만 알기 아깝잖아요" },
      ],
    },
  ],
  economy: [
    {
      title: "월급 빼고 다 오른 요즘, 이렇게 버텨보세요",
      slides: [
        { title: "월급 빼고 다 오른다는 말, 진짜였다", body: "체감 물가 상승률 통계로 확인해보니" },
        { title: "1. 고정비부터 뜯어보기", body: "구독 서비스, 안 쓰는데 자동결제 되는 것 없나요?" },
        { title: "2. 선저축 후지출 습관", body: "월급 들어오자마자 20%는 자동이체로 저축" },
        { title: "3. 소액이라도 분산 투자", body: "예적금 + ETF로 리스크 나누기" },
        { title: "저장해두고 이번 달부터 시작해보세요", body: "작은 습관이 1년 후를 바꿉니다" },
      ],
    },
  ],
  issue: [
    {
      title: "지금 전국이 검색 중인 바로 그 사건",
      slides: [
        { title: "실시간 검색어 1위, 무슨 일?", body: "타임라인으로 한눈에 정리했습니다" },
        { title: "사건의 시작", body: "어제 오후 SNS에 올라온 게시글 하나" },
        { title: "논란이 커진 이유", body: "관련 기관의 뒤늦은 대응이 불씨를 키웠다" },
        { title: "현재 상황", body: "공식 입장 발표 예정, 추가 소식 업데이트 예정" },
        { title: "팔로우하고 실시간으로 받아보세요", body: "다음 소식도 가장 빠르게 전해드립니다" },
      ],
    },
  ],
};

const CATEGORY_LABEL = {
  info: "정보",
  society: "사회",
  entertainment: "연예",
  economy: "경제",
  issue: "이슈",
};
