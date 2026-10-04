import concurrent.futures,hashlib,json,re,io
from pathlib import Path
from urllib.parse import urljoin
import requests
from PIL import Image,ImageOps,ImageDraw
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[1];B='https://www.photostudio.de';D=json.loads((R/'docs/evidence/crawl.json').read_text()); raw={}
for p in D:
 for slug,prod in (p.get('products') or {}).items(): raw[slug]=prod
# Source snapshots before the hydration parser was added: parse retained original HTML.
for p in D:
 if not p.get('products') and p.get('evidence'):
  m=re.search(r'storeInitialState:\s*("(?:\\.|[^"\\])*")',(R/'docs/evidence'/p['evidence']).read_text())
  if m:
   for slug,prod in json.loads(json.loads(m[1])).get('products',{}).items():raw[slug]=prod
(R/'docs/evidence/catalog-raw.json').write_text(json.dumps(raw,ensure_ascii=False,indent=2))
manifest=[];jobs=[]; out=R/'public/images';out.mkdir(exist_ok=True)
orig=R/'docs/evidence/assets';orig.mkdir(exist_ok=True)
def add(url,page,use,key=None):
 url=urljoin(B,url); key=key or hashlib.sha256(url.encode()).hexdigest()[:12];name=key+'.webp'
 jobs.append((url,name,page,use));return '/images/'+name
products=[]
for slug,p in raw.items():
 if not p.get('name'):continue
 p['price']=p.get('price') or p.get('lowestPrice')
 if not p.get('price'):continue
 desc=BeautifulSoup(p.get('description') or '', 'html.parser').get_text(' ',strip=True)
 category=next((x['title'] for x in p.get('links',[]) if x.get('rel')=='main-category'),'Shop')
 fmt='120' if re.search(r'\b120\b|Mittelformat|Rollfilm',p['name'],re.I) else '35mm' if re.search(r'\b135\b|35\s?mm|Kleinbild',p['name'],re.I) else '110' if '110' in p['name'] and 'Entwicklung' in p['name'] else ''
 brand=next((b for b in ['Kodak','CineStill','Ilford','Fujifilm','Pentax','Adox','Jobo','Polaroid','Harman','Analog Store'] if b.lower() in p['name'].lower()),'')
 process='Schwarzweiß' if re.search('Schwarz|Black|B&W|HP5|FP4|Tri-X|Delta|XP2',p['name'],re.I) else 'E-6' if re.search('Ektachrome|Provia|Velvia',p['name'],re.I) else 'C-41' if category=='FILME' else ''
 iso=(re.search(r'\b(50|80|100|125|160|200|400|800|3200)\b',p['name']) or [''])[0]
 imgs=[]
 for i,im in enumerate(p.get('slideshow') or [p.get('image')] ):
  if im and im.get('url') and im.get('type','image')=='image':
   imgs.append(add(im['url'],B+'/p/'+slug,'Product photography',slug+('' if i==0 else '-'+str(i))))
 products.append({'slug':slug,'id':p.get('productId'),'name':p['name'],'price':p['price']['amount'],'priceFormatted':p['price']['formatted'],'stock':p.get('availabilityText') or 'Verfügbarkeit im Originalshop prüfen','inStock':p.get('availabilityText')=='Auf Lager','delivery':p.get('deliveryPeriod') or '', 'brand':brand,'category':category,'format':fmt,'process':process,'iso':iso,'description':desc,'images':imgs,'source':B+'/p/'+slug,'isVariant':bool(p.get('isVariationProduct')),'isMaster':bool(p.get('isVariationMaster')),'variants':(p.get('variations') or {}).get('items',[]),'attributes':(p.get('variations') or {}).get('variationAttributes',[]),'isPastEvent':bool(re.search(r'\b202[0-5]\b',p['name']) and re.search('workshop|photowalk',p['name'],re.I))})
for product in products:
 product['optionLabel']=''; product['masterSlug']=''
for master in products:
 if not master['isMaster'] or master['isVariant']:continue
 for variant in master['variants']:
  child=next((x for x in products if x['slug']==variant.get('slug')),None)
  if not child or not child['isVariant']:continue
  labels=[]
  for attr in master['attributes']:
   value=variant.get('attributes',{}).get(attr['name'])
   labels.append(next((v['displayValue'] for v in attr['values'] if v['value']==value),value or ''))
  child['optionLabel']=' / '.join(label.strip() for label in labels);child['masterSlug']=master['slug'];child['format']=master['format'];child['name']=master['name']+' · '+child['optionLabel']
assets={}
for p in D:
 if p['url']==B+'/':
  for im in p.get('images',[]):
   url=im['url']
   for marker,key in [('Adonal_','scan-adonal'),('Kodak_D-76','scan-d76'),('Silvermax_','scan-silvermax'),('Kodak_HC-110','scan-hc110'),('Filmentwicklung2','lab-film'),('Filmentwicklung4','lab-scan'),('IMG_8192','film-rolls'),('IMG_8272','film-shelf')]:
    if marker in url and key not in assets:assets[key]=add(url,p['url'],'Genuine business lab/sample image',key)
 if p['url'].endswith('/unser-geschaeft'):
  for im in p.get('images',[]):
   for marker,key in [('DSCF3615','store-front'),('DSCF3623','store-inside')]:
    if marker in im['url'] and key not in assets:assets[key]=add(im['url'],p['url'],'Business store image',key)
 if p['url'].endswith('/unsere-geschichte'):
  for im in p.get('images',[]):
   if 'historie' in im['url']:assets['history']=add(im['url'],p['url'],'Historical image','history')
jobs=list({name:(url,name,page,use) for url,name,page,use in jobs}.values())
def download(job):
 url,name,page,use=job
 record={'url':url,'filename':name,'sourcePage':page,'use':use,'rights':'OWNER REVIEW ONLY - owner rights approval pending'}
 try:
  if not (out/name).exists():
   content=requests.get(url,timeout=30).content
   im=ImageOps.exif_transpose(Image.open(io.BytesIO(content))).convert('RGB'); im.thumbnail((1400,1400)); im.save(out/name,'WEBP',quality=86)
   (orig/(name+'.original')).write_bytes(content)
  record['status']='downloaded'
 except Exception as e:record['status']='error';record['error']=str(e)
 return record
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for i,r in enumerate(pool.map(download,jobs)):
  manifest.append(r)
  if i%30==0:print(f'{i+1}/{len(jobs)} assets prepared',flush=True)
(R/'lib/catalog.json').write_text(json.dumps(products,ensure_ascii=False,indent=2));(R/'lib/assets.json').write_text(json.dumps(assets,indent=2));(R/'docs/evidence/asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
# Source service and legal content extraction preserves original body, without navigation/footer.
content={}
for page in D:
 if page.get('status')!=200 or not re.search('/[il]/',page['url']):continue
 so=BeautifulSoup((R/'docs/evidence'/page['evidence']).read_text(),'html.parser')
 m=re.search(r'storeInitialState:\s*("(?:\\.|[^"\\])*")',str(so))
 text=page.get('text','');title=page.get('title','').split(' - der bilder')[0]
 # semantic content extracted from main; falls back to audited full text with common chrome trimmed.
 main=so.find('main')
 if main:text=main.get_text(' ',strip=True)
 else:
  a=text.find('Home',text.find('eBay - Analoge Schätze')+len('eBay - Analoge Schätze'));text=text[a:] if a>=0 else text
 text=text.split('Impressum Datenschutzerklärung Cookie-Richtlinie Allgemeine Geschäftsbedingungen Widerrufsrecht')[0]
 content[page['url'].split('/')[-1]]={'title':title,'text':text,'source':page['url']}
(R/'lib/source-pages.json').write_text(json.dumps(content,ensure_ascii=False,indent=2))
print(json.dumps({'products':len(products),'masters':sum(not x['isVariant'] for x in products),'assets':len(manifest),'errors':[m for m in manifest if m['status']=='error'],'keyAssets':assets},ensure_ascii=False),flush=True)
