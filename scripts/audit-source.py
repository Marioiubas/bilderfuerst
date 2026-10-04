"""Read-only public source audit. Never submits forms or mutates the shop."""
import concurrent.futures, hashlib, json, re, time, xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin, urlparse, urldefrag
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/evidence'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'https://www.photostudio.de'
HEADERS = {'User-Agent': 'Bilderfurst-Remake-Research/1.0 (public read-only audit)'}

def fetch(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=30)
        soup = BeautifulSoup(r.text, 'html.parser')
        ident = hashlib.sha256(url.encode()).hexdigest()[:12]
        (OUT / (ident+'.html')).write_text(r.text)
        links = list(dict.fromkeys(urljoin(BASE, a['href']) for a in soup.select('a[href]')))
        images = [{'alt': a.get('alt',''), 'url': urljoin(BASE, a.get('src','')).replace('{width}','1200')} for a in soup.select('img[src]') if '{width}' not in a['src']]
        structured=[]
        for el in soup.select('script[type="application/ld+json"]'):
            try: structured.append(json.loads(el.string or el.get_text()))
            except Exception: pass
        scripts = [s.get('src','') for s in soup.select('script[src]')]
        match=re.search(r'storeInitialState:\s*("(?:\\.|[^"\\])*")',r.text)
        state=json.loads(json.loads(match[1])) if match else {}
        def navlinks(value):
            if isinstance(value,dict):
                if value.get('href','').startswith(('/i/','/c/')): links.append(urljoin(BASE,value['href']))
                for item in value.values(): navlinks(item)
            elif isinstance(value,list):
                for item in value: navlinks(item)
        navlinks(state.get('navigation',{}))
        for product in state.get('products',{}).values():
            for variant in (product.get('variations') or {}).get('items',[]):
                if variant.get('slug'): links.append(BASE+'/p/'+variant['slug'])
        for el in soup.select('script,style,noscript'): el.decompose()
        content = soup.get_text(' ', strip=True)
        data = {'url':url,'resolvedUrl':r.url,'status':r.status_code,'evidence':ident+'.html', 'title':soup.title.get_text() if soup.title else '', 'description':(soup.select_one('meta[name="description"]') or {}).get('content',''), 'text':content,'links':links,'images':images,'structured':structured,'scripts':scripts,'products':state.get('products',{}),'forms':[{'action':f.get('action'),'method':f.get('method'),'fields':[x.get('name') for x in f.select('input,select')]} for f in soup.select('form')]}
        return data
    except Exception as e: return {'url':url,'error':str(e)}

pages=json.loads((OUT/'crawl.json').read_text()) if (OUT/'crawl.json').exists() else []
visited={p['url'] for p in pages}; pending={BASE+'/'}
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
index=ET.fromstring(requests.get(BASE+'/sitemap.xml', headers=HEADERS, timeout=30).text)
for entry in index.findall('.//s:loc',ns):
    xml=requests.get(entry.text,headers=HEADERS,timeout=30).text
    (OUT/entry.text.split('/')[-1]).write_text(xml)
    pending.update(el.text for el in ET.fromstring(xml).findall('.//s:loc',ns))
for p in pages:
    raw=(OUT/p['evidence']).read_text() if p.get('evidence') else ''
    match=re.search(r'storeInitialState:\s*("(?:\\.|[^"\\])*")',raw)
    if match:
        st=json.loads(json.loads(match[1])); p['products']=st.get('products',{})
        def seed(value):
            if isinstance(value,dict):
                if value.get('href','').startswith(('/i/','/c/')): pending.add(urljoin(BASE,value['href']))
                for item in value.values(): seed(item)
            elif isinstance(value,list):
                for item in value: seed(item)
        seed(st.get('navigation',{}))
        for prod in p['products'].values():
            pending.update(BASE+'/p/'+v['slug'] for v in (prod.get('variations') or {}).get('items',[]) if v.get('slug'))
while pending:
    batch=sorted(pending-visited); pending=set()
    if not batch: break
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for data in pool.map(fetch,batch):
            visited.add(data['url']); pages.append(data)
            for link in data.get('links',[]):
                p=urlparse(urldefrag(link)[0])
                if p.hostname not in ('www.photostudio.de','photostudio.de'): continue
                if p.path.startswith(('/p/','/c/','/i/','/l/')):
                    if p.query and not re.fullmatch(r'page=\d+',p.query): continue
                    normalized=BASE+p.path+(('?'+p.query) if p.query else '')
                    if normalized not in visited: pending.add(normalized)
    print(f'{len(visited)} pages read; {len(pending)} discovered',flush=True)
    (OUT/'crawl.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2))
    if len(visited)>800: break
    time.sleep(.3)
for path in ('/robots.txt','/sitemap.xml','/cart','/checkout'):
    pages.append(fetch(BASE+path))
(OUT/'crawl.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2))
products=[p for p in pages if '/p/' in p['url']]
(OUT/'products.json').write_text(json.dumps(products,ensure_ascii=False,indent=2))
print(json.dumps({'pages':len(pages),'products':len(products),'errors':[p['url'] for p in pages if p.get('error') or p.get('status',200)>=400]},ensure_ascii=False),flush=True)
