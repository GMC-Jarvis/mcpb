import csv
import html
import json

FIELDS = ["grade", "title", "url", "channel", "channel_country", "regions", "provincial",
          "views", "duration_sec", "published", "license", "themes", "advice"]


def to_csv(rows, path):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:  # BOM: opens cleanly in Excel
        w = csv.DictWriter(f, FIELDS)
        w.writeheader()
        w.writerows(rows)


def to_json(rows, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)


def to_html(rows, path):
    body = "".join(
        f"<tr class='g{r['grade']}' data-g='{r['grade']}'><td>{r['grade']}</td>"
        f"<td><a href='{html.escape(r['url'])}' target='_blank' rel='noopener'>{html.escape(r['title'])}</a></td>"
        f"<td>{html.escape(r['channel'])}</td><td>{html.escape(r['regions'])}</td>"
        f"<td data-n='{r['views']}'>{r['views']:,}</td><td>{html.escape(r['license'])}</td>"
        f"<td>{html.escape(r['themes'])}</td><td>{html.escape(r['advice'])}</td></tr>"
        for r in rows)
    page = f"""<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Korea Video Collector</title>
<style>body{{font:14px system-ui;margin:16px}}table{{border-collapse:collapse;width:100%}}
td,th{{border:1px solid #ccc;padding:4px 6px;vertical-align:top}}th{{cursor:pointer;background:#f3f3f3}}
.gA{{background:#e8f8ec}}.gB{{background:#fffbe6}}.gC{{background:#fdecec}}
@media(prefers-color-scheme:dark){{body{{background:#111;color:#eee}}th{{background:#222}}td,th{{border-color:#444}}
.gA{{background:#16301f}}.gB{{background:#332f12}}.gC{{background:#3a1a1a}}a{{color:#8ab4f8}}}}
.wrap{{overflow-x:auto}}</style>
<h1>외국인 한국여행 재창작 후보 ({len(rows)})</h1>
<p>등급 필터: <label><input type=checkbox class=f value=A checked>A</label>
<label><input type=checkbox class=f value=B checked>B</label>
<label><input type=checkbox class=f value=C checked>C</label> · 헤더 클릭=정렬</p>
<div class=wrap><table id=t><thead><tr><th>등급<th>제목<th>채널<th>지역<th>조회수<th>라이선스<th>쇼츠 소재<th>활용 방향</thead>
<tbody>{body}</tbody></table></div>
<script>
const t=document.getElementById('t'),tb=t.tBodies[0];
document.querySelectorAll('.f').forEach(c=>c.onchange=()=>{{const on=[...document.querySelectorAll('.f:checked')].map(x=>x.value);
[...tb.rows].forEach(r=>r.hidden=!on.includes(r.dataset.g))}});
t.tHead.rows[0].querySelectorAll('th').forEach((th,i)=>th.onclick=()=>{{const d=th.d=!th.d?1:-th.d;
const v=r=>{{const c=r.cells[i];return c.dataset.n?+c.dataset.n:c.textContent}};
[...tb.rows].sort((a,b)=>(v(a)>v(b)?1:-1)*d).forEach(r=>tb.appendChild(r))}});
</script>"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(page)
