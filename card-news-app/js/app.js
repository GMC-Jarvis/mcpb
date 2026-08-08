/* 카드뉴스 스튜디오 - 순수 JS + Canvas, 백엔드 없이 localStorage로 상태 저장 */

const STORAGE_KEY = "cardNewsStudio.v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("state load failed", e);
  }
  const channels = {};
  CHANNELS.forEach((c) => {
    channels[c.id] = {
      ...structuredClone(c),
      slides: [{ title: "", body: "", bgImage: null }],
    };
  });
  return { activeChannel: "info", channels };
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activeChannel() {
  return state.channels[state.activeChannel];
}

function activeSlideIndex() {
  const ch = activeChannel();
  if (ch.activeSlide == null || ch.activeSlide >= ch.slides.length) ch.activeSlide = 0;
  return ch.activeSlide;
}

function activeSlide() {
  return activeChannel().slides[activeSlideIndex()];
}

/* ---------- 채널 탭 ---------- */
function renderChannelTabs() {
  const wrap = document.getElementById("channelTabs");
  wrap.innerHTML = "";
  CHANNELS.forEach((c) => {
    const ch = state.channels[c.id];
    const btn = document.createElement("button");
    btn.className = "channel-tab" + (state.activeChannel === c.id ? " active" : "");
    btn.innerHTML = `<span class="order">${c.order}.</span><span class="dot" style="background:${c.color}"></span>${ch.name}`;
    btn.addEventListener("click", () => {
      state.activeChannel = c.id;
      saveState();
      renderAll();
    });
    wrap.appendChild(btn);
  });
}

/* ---------- 프로필 패널 ---------- */
function renderProfilePanel() {
  const ch = activeChannel();
  document.getElementById("avatarPreview").src = ch.avatar || fallbackAvatar(ch.color);
  document.getElementById("channelName").value = ch.name;
  document.getElementById("channelHandle").value = ch.handle;
  document.getElementById("channelBio").value = ch.bio;
}

function fallbackAvatar(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${color}"/></svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

document.getElementById("avatarInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    activeChannel().avatar = reader.result;
    saveState();
    renderProfilePanel();
    drawCanvas();
  };
  reader.readAsDataURL(file);
});

document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const ch = activeChannel();
  ch.name = document.getElementById("channelName").value.trim() || ch.name;
  ch.handle = document.getElementById("channelHandle").value.trim() || ch.handle;
  ch.bio = document.getElementById("channelBio").value.trim();
  saveState();
  renderChannelTabs();
  drawCanvas();
  flash(document.getElementById("saveProfileBtn"), "저장 완료 ✓");
});

function flash(btn, text) {
  const original = btn.textContent;
  btn.textContent = text;
  setTimeout(() => (btn.textContent = original), 1200);
}

/* ---------- 바이럴 문구 세트 ---------- */
function renderViralPicker() {
  const sel = document.getElementById("viralSetSelect");
  sel.innerHTML = "";
  const sets = VIRAL_SETS[state.activeChannel] || [];
  sets.forEach((set, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = set.title;
    sel.appendChild(opt);
  });
}

document.getElementById("applyViralSetBtn").addEventListener("click", () => {
  const sets = VIRAL_SETS[state.activeChannel] || [];
  const idx = Number(document.getElementById("viralSetSelect").value || 0);
  const set = sets[idx];
  if (!set) return;
  const ch = activeChannel();
  ch.slides = set.slides.map((s) => ({ title: s.title, body: s.body, bgImage: null }));
  ch.activeSlide = 0;
  saveState();
  renderAll();
});

/* ---------- 슬라이드 썸네일 / 목록 ---------- */
function renderSlideThumbs() {
  const ch = activeChannel();
  const wrap = document.getElementById("slideThumbs");
  wrap.innerHTML = "";
  ch.slides.forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "slide-thumb" + (i === activeSlideIndex() ? " active" : "");
    el.textContent = i + 1;
    el.addEventListener("click", () => {
      ch.activeSlide = i;
      saveState();
      renderAll();
    });
    wrap.appendChild(el);
  });
}

document.getElementById("addSlideBtn").addEventListener("click", () => {
  const ch = activeChannel();
  ch.slides.push({ title: "", body: "", bgImage: null });
  ch.activeSlide = ch.slides.length - 1;
  saveState();
  renderAll();
});

document.getElementById("dupSlideBtn").addEventListener("click", () => {
  const ch = activeChannel();
  const cur = ch.slides[activeSlideIndex()];
  ch.slides.splice(activeSlideIndex() + 1, 0, { ...cur });
  ch.activeSlide = activeSlideIndex() + 1;
  saveState();
  renderAll();
});

document.getElementById("delSlideBtn").addEventListener("click", () => {
  const ch = activeChannel();
  if (ch.slides.length <= 1) return;
  ch.slides.splice(activeSlideIndex(), 1);
  ch.activeSlide = Math.max(0, activeSlideIndex() - 1);
  saveState();
  renderAll();
});

/* ---------- 필드(제목/본문/배경) ---------- */
function renderFields() {
  const s = activeSlide();
  document.getElementById("slideTitle").value = s.title || "";
  document.getElementById("slideBody").value = s.body || "";
}

document.getElementById("slideTitle").addEventListener("input", (e) => {
  activeSlide().title = e.target.value;
  saveState();
  drawCanvas();
});
document.getElementById("slideBody").addEventListener("input", (e) => {
  activeSlide().body = e.target.value;
  saveState();
  drawCanvas();
});

document.getElementById("bgGradientBtn").addEventListener("click", () => {
  activeSlide().bgImage = null;
  saveState();
  drawCanvas();
});

document.getElementById("bgImageInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    activeSlide().bgImage = reader.result;
    saveState();
    drawCanvas();
  };
  reader.readAsDataURL(file);
});

/* ---------- 캔버스 렌더링 ---------- */
const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

function wrapText(context, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? line + " " + word : word;
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawBackground(ch, slide) {
  if (slide.bgImage) {
    const img = new Image();
    img.onload = () => {
      const scale = Math.max(W / img.width, H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      const overlay = ctx.createLinearGradient(0, H * 0.35, 0, H);
      overlay.addColorStop(0, "rgba(0,0,0,0)");
      overlay.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, W, H);
      drawForeground(ch, slide);
    };
    img.src = slide.bgImage;
  } else {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, ch.gradient[0]);
    grad.addColorStop(1, ch.gradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    drawForeground(ch, slide);
  }
}

function drawForeground(ch, slide) {
  const pad = 72;

  // 카테고리 배지
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  const label = CATEGORY_LABEL[ch.id] || ch.name;
  ctx.font = "600 32px sans-serif";
  const badgeW = ctx.measureText(label).width + 48;
  roundRect(ctx, pad, pad, badgeW, 64, 32);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(label, pad + 24, pad + 34);

  // 채널 정보 (우상단)
  const idx = ch.slides.indexOf(slide);
  const chName = ch.name;
  ctx.font = "600 28px sans-serif";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(chName, W - pad, pad + 34);
  ctx.textAlign = "left";

  // 본문 텍스트 하단 정렬
  const bottom = H - pad;
  ctx.textAlign = "left";

  ctx.font = "400 34px sans-serif";
  const bodyLines = wrapText(ctx, slide.body || "", W - pad * 2);
  let bodyBlockH = bodyLines.length * 46;

  ctx.font = "800 62px sans-serif";
  const titleLines = wrapText(ctx, slide.title || "카드뉴스 제목을 입력하세요", W - pad * 2);
  let titleBlockH = titleLines.length * 76;

  let y = bottom - bodyBlockH - titleBlockH - 20;

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 62px sans-serif";
  titleLines.forEach((line) => {
    ctx.fillText(line, pad, y);
    y += 76;
  });

  y += 6;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "400 34px sans-serif";
  bodyLines.forEach((line) => {
    ctx.fillText(line, pad, y);
    y += 46;
  });

  // 페이지 인디케이터
  ctx.font = "600 28px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.textAlign = "right";
  ctx.fillText(`${idx + 1} / ${ch.slides.length}`, W - pad, bottom + 30);
  ctx.textAlign = "left";

  if (idx === 0 && ch.slides.length > 1) {
    ctx.font = "600 26px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("→ 스와이프해서 더보기", pad, bottom + 30);
  }
}

function roundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function drawCanvas() {
  ctx.clearRect(0, 0, W, H);
  drawBackground(activeChannel(), activeSlide());
}

/* ---------- 다운로드 ---------- */
function downloadCanvasAsPng(filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

document.getElementById("downloadOneBtn").addEventListener("click", () => {
  const ch = activeChannel();
  downloadCanvasAsPng(`${ch.id}_slide_${activeSlideIndex() + 1}.png`);
});

document.getElementById("downloadAllBtn").addEventListener("click", async () => {
  const ch = activeChannel();
  const originalIndex = activeSlideIndex();
  for (let i = 0; i < ch.slides.length; i++) {
    ch.activeSlide = i;
    drawCanvas();
    await new Promise((r) => setTimeout(r, 350)); // 배경 이미지 로드 대기
    downloadCanvasAsPng(`${ch.id}_slide_${i + 1}.png`);
  }
  ch.activeSlide = originalIndex;
  saveState();
  renderAll();
});

/* ---------- 전체 렌더 ---------- */
function renderAll() {
  renderChannelTabs();
  renderProfilePanel();
  renderViralPicker();
  renderSlideThumbs();
  renderFields();
  drawCanvas();
}

renderAll();
