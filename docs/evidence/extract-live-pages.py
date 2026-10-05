#!/usr/bin/env python3
"""Read-only extractor for ePages hydration JSON (stdlib only).

Why: scripts/extract-source-content.py reads page["content"]["elements"], which is EMPTY for
/i/ pages. The real content lives in page["content"]["blocks"] (nested multi-column ->
epages.text / epages.image / ...). This script walks blocks recursively.

Usage (plain GET only, no forms, no cart, no login):
  python3 docs/evidence/extract-live-pages.py > docs/evidence/live-extract-2026-10-05.json
"""
import json, re, sys, time, urllib.request
from html.parser import HTMLParser

BASE = "https://www.photostudio.de"
PAGES = ["/", "/i/galerie", "/i/unsere-geschichte", "/i/wir-digitalisieren", "/i/negativ-digitalisierung",
         "/i/dias-digitalisierung-1", "/i/super8-normal8-16mm-35mm-kino", "/i/alle-videokassetten-und-formate",
         "/i/kontakt-und-oeffnungszeiten", "/i/drop-off-locations", "/i/passbilder-preise",
         "/i/bewerbungsbilder-preise", "/i/fineart-prints", "/i/preisliste", "/i/unser-geschaeft",
         "/i/ebay-analoge-schaetze", "/i/fotostudio", "/i/ueber-uns", "/i/online-terminvergabe", "/l/contact",
         "/p/filmentwicklung-kleinbild", "/p/filmentwicklung-mittelformat", "/p/filmentwicklung-pocket-110",
         "/p/negativ-scan-ganze-rollen"]
BLOCK = {"p", "h1", "h2", "h3", "h4", "li", "tr"}
SKIP = {"script", "style", "iframe"}


class Text(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.out = []; s.cur = []; s.skip = 0
    def handle_starttag(s, t, a):
        if t in SKIP: s.skip += 1
        if t in BLOCK: s.flush()
        if t == "br": s.cur.append(" ")
    def handle_endtag(s, t):
        if t in SKIP: s.skip = max(0, s.skip - 1)
        if t in BLOCK: s.flush()
        if t in ("td", "th"): s.cur.append(" ")
    def handle_data(s, d):
        if not s.skip: s.cur.append(d)
    def flush(s):
        t = re.sub(r"\s+", " ", "".join(s.cur)).strip()
        if t: s.out.append(t)
        s.cur = []


def paras(html):
    p = Text(); p.feed(html); p.flush(); return p.out


def walk(node, text, imgs):
    if isinstance(node, dict):
        d = node.get("data") if isinstance(node.get("data"), dict) else {}
        c = d.get("content")
        if isinstance(c, str) and "<" in c: text.extend(paras(c))
        elif "src" in d and d.get("src"): imgs.append({"src": d["src"], "caption": d.get("text") or None, "link": d.get("link") or None, "w": d.get("width"), "h": d.get("height")})
        for v in node.values():
            if isinstance(v, (dict, list)): walk(v, text, imgs)
    elif isinstance(node, list):
        for x in node: walk(x, text, imgs)


def state(raw):
    m = re.search(r'storeInitialState:\s*("(?:\\.|[^"\\])*")', raw)
    return json.loads(json.loads(m[1])) if m else None


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; read-only GET)"})
    return urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "replace")


def main():
    out = {}
    for path in PAGES:
        raw = get(BASE + path); time.sleep(0.5)
        st = state(raw)
        if not st: continue
        slug = path.rstrip("/").split("/")[-1] or "home"
        rec = {"url": BASE + path}
        if path.startswith("/p/"):
            p = st["products"][slug]
            rec.update(name=p["name"], price=(p.get("price") or {}).get("amount"), lowestPrice=(p.get("lowestPrice") or {}).get("amount"),
                       highestPrice=(p.get("highestPrice") or {}).get("amount"), metaDescription=p.get("metaDescription"),
                       description=paras(p.get("description") or ""))
        else:
            pages = st["legalPagesContents"] if path.startswith("/l/") else st["pages"]
            page = list(st["categories"].values())[0] if path == "/" else pages.get(slug)
            if not page: continue
            c = page.get("content") or {}
            text, imgs = [], []
            walk(c.get("blocks") or [], text, imgs); walk(c.get("elements") or [], text, imgs)
            rec.update(title=page.get("title"), isVisible=page.get("isVisible"), contentUpdatedAt=c.get("updatedAt"), paragraphs=text, images=imgs)
        out[slug] = rec
    json.dump({"fetched": time.strftime("%Y-%m-%d"), "pages": out}, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
