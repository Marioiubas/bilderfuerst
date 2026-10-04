import json,re
from pathlib import Path
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[1];D=json.loads((R/'docs/evidence/crawl.json').read_text()); out={}
for p in D:
 if not re.search('/[il]/',p['url']) or p.get('status')!=200:continue
 slug=p['url'].split('/')[-1];raw=(R/'docs/evidence'/p['evidence']).read_text();m=re.search(r'storeInitialState:\s*("(?:\\.|[^"\\])*")',raw)
 if not m:continue
 st=json.loads(json.loads(m[1]));page=(st.get('legalPagesContents',{}) if '/l/' in p['url'] else st.get('pages',{})).get(slug)
 paragraphs=[]
 if page:
  for el in (page.get('content') or {}).get('elements',[]):
   data=el.get('data') or {}; text=data.get('content')
   if isinstance(text,str):
    soup=BeautifulSoup(text,'html.parser')
    for node in soup.select('script,style,iframe'):node.decompose()
    for node in soup.find_all(['p','h1','h2','h3','h4','li','tr']):
     t=node.get_text(' ',strip=True)
     if t:paragraphs.append(t)
  out[slug]={'title':page.get('title') or p['title'].split(' - der bilder')[0],'paragraphs':paragraphs,'source':p['url']}
 else:
  existing=json.loads((R/'lib/source-pages.json').read_text()).get(slug)
  if existing:out[slug]={'title':existing['title'],'paragraphs':[existing['text']],'source':p['url']}
(R/'lib/source-content.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('source content extracted',len(out));print('booking source: Calenso widget in embedded page state, partner=bilderfuerstfuerth')
print('maps cid',int('275b896f9ff5eccd',16))
